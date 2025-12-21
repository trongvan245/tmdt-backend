import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ example: 'Gốm Xinh Bát Tràng', description: 'Tên cửa hàng' })
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Chuyên cung cấp gốm sứ thủ công...', description: 'Mô tả cửa hàng' })
  @IsOptional()
  @IsString()
  description?: string;
}