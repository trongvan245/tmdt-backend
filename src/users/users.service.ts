import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách tất cả (Chỉ dành cho Admin sau này)
  findAll() {
    return this.prisma.user.findMany({
      select: { // Chỉ lấy các trường cần thiết, KHÔNG lấy password
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      }
    });
  }

  // Lấy chi tiết 1 user
  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { artisanProfile: true } // Nếu là nghệ nhân thì lấy luôn profile
    });
  }

  // Cập nhật user
  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}