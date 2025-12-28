import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ example: 'Cách phân biệt gốm sứ Bát Tràng thật', description: 'Tiêu đề bài viết' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Bài viết hướng dẫn chi tiết...', description: 'Mô tả ngắn' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '# Hướng dẫn chọn gốm...', description: 'Nội dung Markdown' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'https://img.com/cover.jpg', description: 'URL ảnh bìa' })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({ example: ['kinhnghiem', 'gomsu', 'battrang'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate từng phần tử trong mảng phải là string
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '5 phút đọc', description: 'Thời gian đọc ước tính' })
  @IsOptional()
  @IsString()
  readingTime?: string;

  @ApiPropertyOptional({ 
    example: '2023-11-20T08:00:00.000Z', 
    description: 'Ngày tạo bài viết (Dùng để back-date bài cũ)' 
  })
  @IsOptional()
  @IsDateString() // Validate chuỗi ngày tháng chuẩn ISO 8601
  createdAt?: string;
}