import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Quan trọng: Để dùng PrismaService ở mọi nơi mà không cần import lại Module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}