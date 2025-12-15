// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ Header: Authorization: Bearer <token>
      ignoreExpiration: false, // Từ chối nếu token hết hạn
      secretOrKey: process.env.JWT_SECRET || 'DayLaKhoaBiMatCuaDuAnBatTrangCeramics2024', // Phải khớp với lúc sign
    });
  }

  async validate(payload: any) {
    // Hàm này chạy sau khi verify token thành công
    // Nó sẽ gắn user vào req.user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    
    // Bỏ mật khẩu đi cho an toàn
    if (user) delete user.password;
    
    return user; 
  }
}