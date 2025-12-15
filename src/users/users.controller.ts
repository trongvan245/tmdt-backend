// src/users/users.controller.ts
import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// Import cái mới vừa tạo
import { CurrentUser } from '../common/decorator/user.decorator';
import { UserPayload } from '../common/model/user.model';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CÁCH MỚI: Dùng @CurrentUser
  @Get('me')
  getProfile(@CurrentUser() user: UserPayload) {
    // Bây giờ bạn gõ "user." nó sẽ gợi ý id, email, fullName... cực sướng
    console.log('ID user là:', user.id); 
    return user;
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: UserPayload, // Lấy cả object user
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
  
  // Ví dụ: Nếu chỉ muốn lấy ID cho nhanh
  // @Get('test-id')
  // testId(@CurrentUser('id') userId: number) {
  //   return `ID của tôi là ${userId}`;
  // }
}