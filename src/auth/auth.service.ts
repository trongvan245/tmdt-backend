import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // 1. Đăng ký
  async register(dto: RegisterDto) {
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          fullName: dto.fullName,
          role: dto.role || 'CUSTOMER',
        },
      });

      // Trả về user (nhớ xóa password đi trước khi trả về)
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email này đã tồn tại');
        }
      }
      throw error;
    }
  }

  // 2. Đăng nhập
  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('Sai email hoặc mật khẩu');

    // So sánh password
    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new ForbiddenException('Sai email hoặc mật khẩu');

    // Tạo Token
    return this.signToken(user.id, user.email, user.role);
  }

  // Helper tạo Token
  async signToken(userId: number, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d', // Token sống 1 ngày
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token: token,
    };
  }
}