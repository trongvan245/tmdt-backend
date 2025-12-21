import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Role } from '@prisma/client'; // Import Enum Role

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  // 1. Đăng ký mở Shop
  async create(userId: number, createShopDto: CreateShopDto) {
    // Kiểm tra xem user này đã có shop chưa
    const existingShop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    if (existingShop) {
      throw new BadRequestException('Bạn đã sở hữu một cửa hàng rồi!');
    }

    // Dùng transaction để đảm bảo cả 2 việc cùng thành công: Tạo Shop & Update Role
    return this.prisma.$transaction(async (tx) => {
      // B1: Tạo shop
      const shop = await tx.shop.create({
        data: {
          ...createShopDto,
          ownerId: userId,
        },
      });

      // B2: Cập nhật User Role lên SELLER
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.SELLER },
      });

      return shop;
    });
  }

  // 2. Xem Shop của chính mình (My Shop)
  async findMyShop(userId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
      include: {
        products: { take: 5 }, // Gợi ý lấy kèm vài sản phẩm demo
      },
    });

    if (!shop) throw new NotFoundException('Bạn chưa có cửa hàng nào.');
    return shop;
  }

  // 3. Xem Shop công khai (Cho người mua xem)
  async findOne(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        // Có thể include user để lấy avatar chủ shop nếu cần
        owner: { select: { fullName: true, email: true } }, 
      },
    });

    if (!shop) throw new NotFoundException(`Không tìm thấy cửa hàng số ${id}`);
    return shop;
  }

  // 4. Cập nhật Shop
  async update(userId: number, updateShopDto: UpdateShopDto) {
    // Tìm shop của user hiện tại
    const shop = await this.findMyShop(userId);

    return this.prisma.shop.update({
      where: { id: shop.id },
      data: updateShopDto,
    });
  }
}