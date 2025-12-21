// src/auth/dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // Import từ đây
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  BUYER = 'BUYER', // Added BUYER role
}

export class RegisterDto {
  @ApiProperty({ example: 'nghe_nhan@gmail.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Họ tên' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: Role, required: false }) // Hiện menu chọn Role trên Swagger
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class LoginDto {
  @ApiProperty({ example: 'nghe_nhan@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}