import { 
  Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Giả sử bạn đã có Guard này
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { UserPayload } from 'src/common/model/user.model';

@ApiTags('shops')
@ApiBearerAuth()
@Controller('shops')

export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard) // Bắt buộc phải đăng nhập mới được tạo shop
  @ApiOperation({ summary: 'Đăng ký trở thành người bán (Tạo Shop)' })
  @ApiResponse({ status: 201, description: 'Tạo cửa hàng thành công.' })
  @ApiResponse({ status: 400, description: 'User đã có cửa hàng.' })
  create(
    @CurrentUser() user: UserPayload, // <--- Dùng Decorator xịn ở đây
    @Body() createShopDto: CreateShopDto
  ) {
    // user.id lấy trực tiếp từ Token đã decode
    return this.shopsService.create(user.id, createShopDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem thông tin shop của tôi' })
  findMyShop(@CurrentUser() user: UserPayload) {
    console.log(`User ${user.email} đang xem shop của mình`);
    return this.shopsService.findMyShop(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin shop của tôi' })
  update(
    @CurrentUser() user: UserPayload, 
    @Body() updateShopDto: UpdateShopDto
  ) {
    return this.shopsService.update(user.id, updateShopDto);
  }

  // API này Public (không cần login) để khách xem hàng
  @Get(':id')
  @ApiOperation({ summary: 'Xem thông tin shop bất kỳ (Public)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.findOne(id);
  }
}