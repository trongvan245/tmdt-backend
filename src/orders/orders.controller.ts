import { 
  Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/user.decorator';
import { UserPayload } from '../common/model/user.model';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Bắt buộc đăng nhập cho toàn bộ API Order
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng (Tự động tách đơn theo Shop)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công, trả về mảng các đơn hàng.' })
  create(@CurrentUser() user: UserPayload, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng (Theo vai trò: Buyer/Seller)' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.ordersService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái (Buyer: Hủy/Nhận - Seller: Xử lý/Giao)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, user.id, updateOrderStatusDto);
  }
}