import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Tên hiển thị' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullName?: string;

  // Avatar sẽ được xử lý riêng qua FileInterceptor, không cần khai báo ở đây để validate
}