import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Prisma, Role } from '@prisma/client'; // Import Enum Role
import { FilterShopDto, ShopSortOption } from './dto/filter-shop.dto';

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
      const shop = await tx.shop.create({
            data: {
              ownerId: userId,
              name: createShopDto.name,
              description: createShopDto.description,
              
              // THÊM DÒNG NÀY:
              villageName: createShopDto.villageName, 
            },
          });

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

  async findAll(query: FilterShopDto) {
    const { search, sortBy, page, limit } = query;
    const skip = (page - 1) * limit;

    // 1. Xây dựng điều kiện lọc (WHERE)
    const where: Prisma.ShopWhereInput = {};
    
    if (search) {
      where.name = { 
        contains: search, 
        mode: 'insensitive' // Tìm kiếm không phân biệt hoa thường (Postgres)
      };
    }

    // 2. Xây dựng điều kiện sắp xếp (ORDER BY)
    let orderBy: Prisma.ShopOrderByWithRelationInput = { createdAt: 'desc' }; // Mặc định: Mới nhất lên đầu

    switch (sortBy) {
      case ShopSortOption.NAME_ASC:
        orderBy = { name: 'asc' };
        break;
      case ShopSortOption.NAME_DESC:
        orderBy = { name: 'desc' };
        break;
      case ShopSortOption.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case ShopSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 3. Thực thi query
    const [shops, total] = await Promise.all([
      this.prisma.shop.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          _count: { select: { products: true } } // (Optional) Đếm xem shop có bao nhiêu sp
        }
      }),
      this.prisma.shop.count({ where }),
    ]);

    return {
      data: shops,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateShopImages(
    userId: number, 
    avatarFile?: Express.Multer.File, 
    coverFile?: Express.Multer.File
  ) {
    // 1. Tìm shop của user
    const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) throw new NotFoundException('Bạn chưa có cửa hàng');

    // 2. Chuẩn bị dữ liệu update
    const dataToUpdate: any = {};

    if (avatarFile) {
      // Lưu đường dẫn ảnh avatar
      dataToUpdate.avatarUrl = `/uploads/shops/${avatarFile.filename}`;
    }

    if (coverFile) {
      // Lưu đường dẫn ảnh bìa
      dataToUpdate.coverUrl = `/uploads/shops/${coverFile.filename}`;
    }

    // 3. Update Database
    return this.prisma.shop.update({
      where: { id: shop.id },
      data: dataToUpdate,
    });
  }
}