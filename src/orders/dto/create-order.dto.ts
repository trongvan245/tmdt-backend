import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID Sản phẩm' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2, description: 'Số lượng mua' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Danh sách sản phẩm mua', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '123 Đường Láng, Hà Nội', description: 'Địa chỉ nhận hàng' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại người nhận' })
  @IsNotEmpty()
  @IsString()
  phone: string;
}