import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService], // Export service để module Product có thể dùng (check shop exists)
})
export class ShopsModule {}