import { 
  Injectable, NotFoundException, BadRequestException, ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // --- 1. TẠO ĐƠN HÀNG (Tự động tách đơn theo Shop) ---
  async create(userId: number, dto: CreateOrderDto) {
    const { items, address, phone } = dto;

    // 1. Lấy thông tin chi tiết các sản phẩm từ DB (để lấy giá và shopId chuẩn)
    const productIds = items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, shopId: true, stockQuantity: true }
    });

    if (products.length !== items.length) {
      throw new BadRequestException('Một số sản phẩm không tồn tại');
    }

    // 2. Nhóm sản phẩm theo ShopId
    // Map<ShopId, List<Item>>
    const ordersByShop = new Map<number, { productId: number; quantity: number; price: number }[]>();

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      // Validate tồn kho (Optional)
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(`Sản phẩm ID ${product.id} không đủ hàng`);
      }

      if (!ordersByShop.has(product.shopId)) {
        ordersByShop.set(product.shopId, []);
      }
      
      // Thêm vào nhóm của Shop đó (Lấy giá từ DB để bảo mật)
      ordersByShop.get(product.shopId).push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price)
      });
    }

    // 3. Tạo các đơn hàng (Dùng Transaction để đảm bảo tạo hết hoặc không tạo gì cả)
    return this.prisma.$transaction(async (tx) => {
      const createdOrders = [];

      for (const [shopId, shopItems] of ordersByShop) {
        // Tính tổng tiền cho đơn hàng của Shop này
        const totalAmount = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Tạo Order
        const order = await tx.order.create({
          data: {
            userId,
            shopId, // Quan trọng: Đơn hàng gắn với Shop cụ thể
            totalAmount,
            address,
            phone,
            status: OrderStatus.PENDING,
            orderItems: {
              create: shopItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });
        createdOrders.push(order);
        
        // Trừ tồn kho (Optional)
        for (const item of shopItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
            });
        }
      }

      return createdOrders;
    });
  }

  // --- 2. LẤY DANH SÁCH ĐƠN HÀNG ---
  async findAll(userId: number, role: Role) {
    // 1. ADMIN: Xem hết, kèm Product
    if (role === Role.ADMIN) {
      return this.prisma.order.findMany({ 
        include: { 
          shop: true, 
          orderItems: { 
            include: { product: true } // <--- Thêm dòng này
          } 
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // 2. SELLER: Xem đơn của shop mình, kèm Product
    if (role === Role.SELLER) {
      const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
      if (!shop) return [];

      return this.prisma.order.findMany({
        where: { shopId: shop.id },
        include: { 
          user: { select: { fullName: true, avatarUrl: true } }, // Lấy thêm avatar khách cho đẹp
          orderItems: { 
            include: { product: true } // <--- Thêm dòng này
          } 
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // 3. BUYER: Xem đơn đã mua, kèm Product
    return this.prisma.order.findMany({
      where: { userId },
      include: { 
        shop: { select: { name: true, avatarUrl: true } }, 
        orderItems: { 
          include: { product: true } // <--- Thêm dòng này
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- 3. LẤY CHI TIẾT 1 ĐƠN ---
  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { 
        shop: true, 
        orderItems: { include: { product: true } } 
      }
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Check quyền xem
    if (role === Role.ADMIN) return order;
    
    // Buyer chỉ xem đơn của mình
    if (order.userId === userId) return order;

    // Seller chỉ xem đơn thuộc shop mình
    if (order.shop.ownerId === userId) return order;

    throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
  }

  // --- 4. CẬP NHẬT TRẠNG THÁI (Logic cốt lõi) ---
  async updateStatus(id: number, userId: number, dto: UpdateOrderStatusDto) {
    // 1. Tìm đơn hàng kèm theo danh sách sản phẩm (orderItems) để sau này tính soldCount
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { 
        shop: true,
        orderItems: true // <--- QUAN TRỌNG: Cần lấy cái này để biết số lượng từng món
      }
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // --- LOGIC CHẶN SỬA KHI ĐÃ HOÀN THÀNH ---
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Đơn hàng đã hoàn thành và chốt sổ, không thể thay đổi trạng thái được nữa.');
    }
    
    if (order.status === OrderStatus.CANCELLED) {
       throw new BadRequestException('Đơn hàng đã hủy, không thể khôi phục.');
    }
    // ----------------------------------------

    const isBuyer = order.userId === userId;
    const isSeller = order.shop.ownerId === userId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn này');
    }

    const newStatus = dto.status;

    // --- CHECK QUYỀN VÀ LOGIC CHUYỂN TRẠNG THÁI ---
    if (isBuyer) {
      // Buyer: Chỉ được HỦY (khi Pending) hoặc NHẬN HÀNG (khi Shipping)
      if (newStatus === OrderStatus.CANCELLED) {
        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException('Đơn hàng đã được xử lý, không thể hủy');
        }
      } else if (newStatus === OrderStatus.COMPLETED) {
        if (order.status !== OrderStatus.SHIPPING) {
          throw new BadRequestException('Chỉ có thể xác nhận khi đơn đang giao');
        }
      } else {
        throw new ForbiddenException('Người mua không có quyền thực hiện trạng thái này');
      }
    }

    if (isSeller) {
       // Seller: Không được chuyển về trạng thái lùi (VD: Đang Shipping quay về Pending)
       // Logic đơn giản: Cho phép Seller chuyển tiếp hoặc Hủy
    }

    // --- THỰC HIỆN UPDATE (DÙNG TRANSACTION) ---
    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái đơn hàng
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: newStatus }
      });

      // 2. Nếu trạng thái mới là COMPLETED -> Cộng soldCount cho các sản phẩm
      if (newStatus === OrderStatus.COMPLETED) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { 
              soldCount: { increment: item.quantity } // Cộng dồn số lượng đã bán
            }
          });
        }
      }

      // (Tùy chọn) Nếu trạng thái mới là CANCELLED -> Hoàn lại stockQuantity (Tồn kho)
      // nếu trước đó lúc tạo đơn bạn đã trừ tồn kho.
      if (newStatus === OrderStatus.CANCELLED) {
         for (const item of order.orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { increment: item.quantity } }
            });
         }
      }

      return updatedOrder;
    });
  }
}