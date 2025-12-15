// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Nguyen Van B', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  // Bạn có thể thêm avatar, phone, address ở đây sau này
}