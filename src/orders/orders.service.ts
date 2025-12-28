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
    if (role === Role.ADMIN) {
      return this.prisma.order.findMany({ include: { shop: true, orderItems: true } });
    }

    // Nếu là Seller: Lấy các đơn hàng thuộc Shop của mình
    if (role === Role.SELLER) {
      // Tìm shop của user này trước
      const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
      if (!shop) return []; // Chưa có shop thì chưa có đơn bán

      return this.prisma.order.findMany({
        where: { shopId: shop.id },
        include: { user: { select: { fullName: true } }, orderItems: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Nếu là Buyer: Lấy các đơn mình đã mua
    return this.prisma.order.findMany({
      where: { userId },
      include: { shop: { select: { name: true } }, orderItems: true },
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shop: true }
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const isBuyer = order.userId === userId;
    const isSeller = order.shop.ownerId === userId; // Check chủ shop trực tiếp

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn này');
    }

    const currentStatus = order.status;
    const newStatus = dto.status;

    // --- LOGIC CHO BUYER ---
    if (isBuyer) {
      // Buyer chỉ được HỦY khi đơn còn PENDING
      if (newStatus === OrderStatus.CANCELLED) {
        if (currentStatus !== OrderStatus.PENDING) {
          throw new BadRequestException('Đơn hàng đã được xử lý, không thể hủy');
        }
      }
      // Buyer xác nhận ĐÃ NHẬN HÀNG khi đang SHIPPING
      else if (newStatus === OrderStatus.COMPLETED) {
        if (currentStatus !== OrderStatus.SHIPPING) {
          throw new BadRequestException('Chỉ có thể xác nhận khi đơn đang giao');
        }
      } 
      else {
        throw new ForbiddenException('Người mua không có quyền thực hiện trạng thái này');
      }
    }

    // --- LOGIC CHO SELLER ---
    if (isSeller) {
       // Seller không thể quay ngược trạng thái (VD: Completed -> Pending)
       // Seller không thể sửa đơn đã Cancel hoặc Completed
       if (currentStatus === OrderStatus.CANCELLED || currentStatus === OrderStatus.COMPLETED) {
         throw new BadRequestException('Đơn hàng đã kết thúc, không thể thay đổi');
       }
       
       // Quy trình chuẩn: PENDING -> PREPARING -> SHIPPING -> COMPLETED
       // Seller cũng có thể Hủy đơn (CANCELLED) nếu hết hàng
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus }
    });
  }
}