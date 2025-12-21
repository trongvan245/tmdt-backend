import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import module chứa PrismaService

@Module({
  imports: [PrismaModule], 
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export nếu module khác (như Order) cần dùng
})
export class ProductsModule {}