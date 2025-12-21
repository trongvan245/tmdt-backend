import { 
  Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/user.decorator';
import { UserPayload } from '../common/model/user.model';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Toàn bộ module này yêu cầu đăng nhập
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới (Checkout)' })
  @ApiResponse({ status: 201, description: 'Đặt hàng thành công' })
  create(
    @CurrentUser() user: UserPayload, 
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Xem lịch sử mua hàng của tôi (Buyer)' })
  getMyOrders(@CurrentUser() user: UserPayload) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Get('shop-orders')
  @ApiOperation({ summary: 'Xem danh sách đơn hàng của Shop tôi (Seller)' })
  getOrdersForShop(@CurrentUser() user: UserPayload) {
    // Cần check role SELLER ở đây hoặc trong Service nếu muốn chặt chẽ
    return this.ordersService.getOrdersForShop(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload
  ) {
    return this.ordersService.findOne(id, user.id);
  }
}