import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator'; // <--- Import

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // <--- Mở cửa cho API này
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public() // <--- Mở cửa cho API này
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}