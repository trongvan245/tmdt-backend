import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// 1. Định nghĩa các kiểu sắp xếp
export enum ProductSort {
  NEWEST = 'newest',         // Mới nhất
  OLDEST = 'oldest',         // Cũ nhất
  PRICE_ASC = 'price_asc',   // Giá tăng dần
  PRICE_DESC = 'price_desc', // Giá giảm dần
  SOLD_DESC = 'sold_desc',   // Bán chạy nhất (Cao -> Thấp)
  VIEW_DESC = 'view_desc',   // Xem nhiều nhất (Cao -> Thấp)
}

export class FilterProductDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên sản phẩm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc sản phẩm theo ID cửa hàng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shopId?: number;

  // 2. Thêm trường SortBy vào DTO
  @ApiPropertyOptional({ 
    enum: ProductSort, 
    description: 'Sắp xếp: newest, oldest, price_asc, price_desc, sold_desc, view_desc' 
  })
  @IsOptional()
  @IsEnum(ProductSort)
  sortBy?: ProductSort;

  // ... (Các trường cũ minPrice, maxPrice, category, page, limit giữ nguyên)
  @ApiPropertyOptional({ description: 'Giá thấp nhất' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá cao nhất' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Danh mục sản phẩm' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}