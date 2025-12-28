import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { Prisma } from '@prisma/client';
import defaultSlugify from 'slugify'; // Đổi tên import để tránh trùng

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo bài Blog
  async create(userId: number, createBlogDto: CreateBlogDto) {
    const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) throw new ForbiddenException('Bạn phải có Shop mới được viết Blog');

    const slugRaw = defaultSlugify(createBlogDto.title, { lower: true, strict: true, locale: 'vi' });
    const slug = `${slugRaw}-${Date.now()}`;

    return this.prisma.blog.create({
      data: {
        shopId: shop.id,
        title: createBlogDto.title,
        slug: slug,
        description: createBlogDto.description,
        content: createBlogDto.content,
        coverUrl: createBlogDto.coverUrl,
        tags: createBlogDto.tags || [],
        isPublished: createBlogDto.isPublished ?? true,
        
        // --- THÊM 2 DÒNG NÀY ---
        readingTime: createBlogDto.readingTime,
        // Nếu client gửi ngày lên thì dùng, không thì để Prisma tự lấy now()
        createdAt: createBlogDto.createdAt ? new Date(createBlogDto.createdAt) : undefined,
      },
    });
  }

  // 2. Lấy danh sách Blog (Public)
  async findAll(query: FilterBlogDto) {
    const { search, tag, shopId } = query;
    
    const where: Prisma.BlogWhereInput = {
      isPublished: true, // Chỉ lấy bài đã public
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (tag) {
      // Postgres Array contains: Lọc bài có chứa tag này trong mảng tags
      where.tags = { has: tag };
    }

    if (shopId) {
      where.shopId = Number(shopId);
    }

    return this.prisma.blog.findMany({
      where,
      include: { shop: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Xem chi tiết (Public) - Tìm theo ID hoặc Slug
  async findOne(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { shop: true },
    });
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    return blog;
  }

  // 4. Cập nhật Blog (Chỉ chủ shop)
  async update(id: number, userId: number, updateBlogDto: UpdateBlogDto) {
    const blog = await this.findOne(id);
    const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
    
    if (!shop || blog.shopId !== shop.id) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        // ... các trường khác tự động mapping
        ...updateBlogDto,
        
        // Riêng createdAt cần convert từ String sang Date nếu có
        createdAt: updateBlogDto.createdAt ? new Date(updateBlogDto.createdAt) : undefined,
      },
    });
  }

  // 5. Xóa Blog
  async remove(id: number, userId: number) {
    const blog = await this.findOne(id);
    const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
    
    if (!shop || blog.shopId !== shop.id) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    return this.prisma.blog.delete({ where: { id } });
  }
}