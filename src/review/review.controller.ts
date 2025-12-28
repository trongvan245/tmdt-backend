import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseIntPipe, Query 
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/user.decorator';
import { UserPayload } from '../common/model/user.model';
import { Public } from '../auth/public.decorator';
import { ReviewsService } from './review.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Viết đánh giá cho sản phẩm (User)' })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công' })
  @ApiResponse({ status: 409, description: 'Đã đánh giá sản phẩm này rồi' })
  create(@CurrentUser() user: UserPayload, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Xem danh sách đánh giá của 1 sản phẩm (Public)' })
  findAllByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findAllByProduct(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sửa nội dung đánh giá (Chính chủ)' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @CurrentUser() user: UserPayload,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(id, user.id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đánh giá (Chính chủ)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.reviewsService.remove(id, user.id);
  }
}