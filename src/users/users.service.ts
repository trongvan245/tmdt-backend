import { Injectable, NotFoundException } from '@nestjs/common';
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
      include: { } // Nếu là nghệ nhân thì lấy luôn profile
    });
  }

  // Cập nhật user
  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateProfile(userId: number, dto: UpdateUserDto, avatarFile?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const dataToUpdate: any = {
      ...dto, // Cập nhật fullName nếu có
    };

    if (avatarFile) {
      // Lưu đường dẫn ảnh nếu có file upload
      dataToUpdate.avatarUrl = `/uploads/users/${avatarFile.filename}`;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Chỉ trả về các trường an toàn
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      }
    });
  }
}