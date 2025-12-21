import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Import này

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'ID của Shop đăng bán' })
  @IsNotEmpty()
  @IsNumber()
  shopId: number;

  @ApiProperty({ example: 'Bình gốm hoa lam', description: 'Tên sản phẩm' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sản phẩm gốm thủ công...', description: 'Mô tả chi tiết' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 500000, description: 'Giá sản phẩm (VNĐ)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Số lượng trong kho' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 'Gốm sứ', description: 'Danh mục sản phẩm' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Đất nung', description: 'Chất liệu chính' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'Bát Tràng', description: 'Vùng miền/Xuất xứ' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ 
    example: ['https://anh1.com/a.jpg', 'https://anh2.com/b.jpg'], 
    description: 'Danh sách URL ảnh sản phẩm',
    type: [String] // Quan trọng để Swagger hiện ô nhập mảng
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate từng phần tử trong mảng phải là string
  images?: string[];
}