import { 
  Injectable, NotFoundException, ConflictException, ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo Review
  async create(userId: number, dto: CreateReviewDto) {
    // Check sản phẩm có tồn tại không
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Check xem user đã review sản phẩm này chưa
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId }
      }
    });

    if (existingReview) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // TODO: (Nâng cao) Check xem user đã MUA sản phẩm này chưa (check bảng Order)

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  // 2. Lấy danh sách Review theo Product ID
  async findAllByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } }, // Lấy info người review
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Sửa Review
  async update(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');

    // Chỉ chủ sở hữu mới được sửa
    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa đánh giá này');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  // 4. Xóa Review
  async remove(id: number, userId: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');

    // Chủ sở hữu hoặc Admin mới được xóa (Ở đây tạm làm chủ sở hữu)
    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    return this.prisma.review.delete({ where: { id } });
  }
}