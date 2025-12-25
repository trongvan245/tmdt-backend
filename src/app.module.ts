// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; // <--- Import cái này
import { JwtAuthGuard } from './auth/jwt-auth.guard'; // <--- Guard vừa tạo
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ShopsModule } from './shops/shops.module';
import { OrdersModule } from './orders/orders.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// ... các import khác

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    ProductsModule, 
    ShopsModule,
    OrdersModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Thư mục lưu ảnh gốc
      serveRoot: '/uploads', // Đường dẫn ảo trên URL
    }),
    // ...
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD, // Đăng ký Guard toàn cục ở đây
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}