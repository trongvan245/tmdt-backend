import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBlogDto {
  @ApiPropertyOptional({ description: 'Tìm theo tiêu đề' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Tìm theo Tags' })
  @IsOptional()
  @IsString()
  tag?: string;
  
  // Có thể thêm shopId để lọc bài viết của 1 shop cụ thể
  @ApiPropertyOptional()
  @IsOptional()
  shopId?: string; 
}