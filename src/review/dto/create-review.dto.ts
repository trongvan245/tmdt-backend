import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 1, description: 'ID của sản phẩm cần đánh giá' })
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @ApiProperty({ example: 5, description: 'Số sao đánh giá (1-5)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Sản phẩm rất tốt, đóng gói cẩn thận!', description: 'Nội dung đánh giá' })
  @IsOptional()
  @IsString()
  comment?: string;
}