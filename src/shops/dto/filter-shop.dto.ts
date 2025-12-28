import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Định nghĩa các kiểu sắp xếp cho rõ ràng
export enum ShopSortOption {
  NAME_ASC = 'name_asc',       // Tên A-Z
  NAME_DESC = 'name_desc',     // Tên Z-A
  NEWEST = 'newest',           // Mới tạo gần đây
  OLDEST = 'oldest',           // Cũ nhất
}

export class FilterShopDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên shop' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    enum: ShopSortOption, 
    description: 'Sắp xếp theo: name_asc, name_desc, newest, oldest' 
  })
  @IsOptional()
  @IsEnum(ShopSortOption)
  sortBy?: ShopSortOption;

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