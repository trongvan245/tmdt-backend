import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Đường dẫn tùy project của bạn
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
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
    const { page, limit, search, category, minPrice, maxPrice, sortBy } = query;
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: Prisma.ProductWhereInput = {
      AND: [
        search ? { name: { contains: search, mode: 'insensitive' } } : {},
        category ? { category: { equals: category } } : {},
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
      ],
    };

    // Xây dựng sắp xếp
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    // Chạy song song count và findMany
    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          shop: { select: { name: true, isVerified: true } },
        },
      }),
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
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
}