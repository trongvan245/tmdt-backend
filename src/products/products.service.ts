import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Đường dẫn tùy project của bạn
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto, ProductSort } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // Kế thừa PartialType(CreateProductDto)
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo sản phẩm
  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        shopId: createProductDto.shopId, // (Hoặc lấy từ user token)
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stockQuantity: createProductDto.stockQuantity,
        category: createProductDto.category,
        material: createProductDto.material,
        origin: createProductDto.origin,
        
        // GÁN TRỰC TIẾP:
        images: createProductDto.images || [], 
      },
    });
  }

  // 2. Lấy danh sách (Filter & Pagination)
  async findAll(query: FilterProductDto) {
    const { 
      search, minPrice, maxPrice, category, shopId, 
      sortBy, // Lấy tham số sortBy
      page, limit 
    } = query;

    const skip = (page - 1) * limit;

    // 1. Xử lý điều kiện lọc (WHERE) - Giữ nguyên logic cũ
    const where: Prisma.ProductWhereInput = {};

    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (shopId) where.shopId = shopId;
    if (category) where.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // 2. Xử lý sắp xếp (ORDER BY) - LOGIC MỚI
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // Mặc định: Mới nhất

    switch (sortBy) {
      case ProductSort.PRICE_ASC:
        orderBy = { price: 'asc' };
        break;
      case ProductSort.PRICE_DESC:
        orderBy = { price: 'desc' };
        break;
      case ProductSort.SOLD_DESC: // Bán chạy
        orderBy = { soldCount: 'desc' };
        break;
      case ProductSort.VIEW_DESC: // Xem nhiều
        orderBy = { viewCount: 'desc' };
        break;
      case ProductSort.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case ProductSort.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 3. Thực thi Query
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: orderBy, // Truyền biến orderBy vào đây
        include: {
          shop: { select: { name: true, avatarUrl: true, villageName: true } }
        }
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Lấy chi tiết 1 sản phẩm
  async findOne(id: number) {
    // 1. Tăng view lên 1 (Atomic update - an toàn khi nhiều người click cùng lúc)
    await this.prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 2. Lấy dữ liệu trả về
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  // 4. Cập nhật (Cần check quyền sở hữu - ở đây demo logic cơ bản)
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Logic check tồn tại
    await this.findOne(id); 

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // 5. Xóa
  async remove(id: number) {
    await this.findOne(id); // Check tồn tại trước
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async uploadImages(productId: number, files: Array<Express.Multer.File>) {
  const imageUrls = files.map(file => `/uploads/products/${file.filename}`);

  return this.prisma.product.update({
    where: { id: productId },
    data: {
      images: {
        push: imageUrls, // Tính năng của Prisma với Postgres: thêm vào mảng hiện có
      },
    },
  });
}

  async findByShop(shopId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Chạy song song 2 câu lệnh: Lấy data và Đếm tổng số (để FE chia trang)
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { shopId },
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' }, // Sản phẩm mới nhất lên đầu
        include: {
          // Lấy thêm thông tin Shop (chỉ lấy tên và avatar cho nhẹ)
          shop: { select: { name: true, avatarUrl: true, isVerified: true } },
        },
      }),
      this.prisma.product.count({ where: { shopId } }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}