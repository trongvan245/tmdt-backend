import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus, 
    description: 'Trạng thái: PENDING, PREPARING, SHIPPING, COMPLETED, CANCELLED' 
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}