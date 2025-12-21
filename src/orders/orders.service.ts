import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserPayload } from 'src/common/model/user.model';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 1. TẠO ĐƠN HÀNG (Phức tạp nhất)
  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { items, address, phone } = createOrderDto;

    // B1: Lấy danh sách ID sản phẩm từ request
    const productIds = items.map((item) => item.productId);

    // B2: Tìm thông tin sản phẩm từ Database (để lấy giá chuẩn và check tồn kho)
    const productsInDb = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Validate: Có sản phẩm nào không tồn tại không?
    if (productsInDb.length !== items.length) {
      throw new BadRequestException('Một số sản phẩm không tồn tại hoặc đã bị xóa');
    }

    // B3: Tính toán tổng tiền & Chuẩn bị dữ liệu order items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = productsInDb.find((p) => p.id === item.productId);

      // Check tồn kho
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} không đủ số lượng tồn kho`);
      }

      // Tính tiền (Ép kiểu Decimal sang Number để tính toán)
      const price = Number(product.price); 
      totalAmount += price * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price, // Lưu giá tại thời điểm mua
      });
    }

    // B4: Dùng Transaction để Ghi đơn hàng VÀ Trừ tồn kho
    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          address,
          phone,
          status: 'PENDING',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: { orderItems: true }, // Trả về kèm item để frontend hiển thị
      });

      // 2. Trừ tồn kho từng sản phẩm
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      return order;
    });
  }

  // 2. LẤY LỊCH SỬ MUA HÀNG (Của người mua)
  async getMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. LẤY ĐƠN HÀNG CHO CHỦ SHOP (SELLER)
  // Logic: Tìm các đơn hàng có chứa sản phẩm thuộc Shop của user này
  async getOrdersForShop(userId: number) {
    // Tìm shop của user
    const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) throw new BadRequestException('Bạn chưa có cửa hàng');

    // Query phức tạp: Lấy Order mà trong OrderItems có Product thuộc Shop này
    return this.prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: { shopId: shop.id },
          },
        },
      },
      include: {
        user: { select: { fullName: true, email: true } }, // Xem ai mua
        orderItems: {
          where: { product: { shopId: shop.id } }, // Chỉ hiển thị sản phẩm của shop mình
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. CHI TIẾT ĐƠN HÀNG
  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    
    // Bảo mật: Chỉ chủ đơn hàng hoặc Admin mới được xem (Seller xem qua API khác)
    if (order.userId !== userId) {
      // throw new ForbiddenException(); // Tùy logic bạn
    }

    return order;
  }
}