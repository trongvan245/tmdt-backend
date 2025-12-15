// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Kích hoạt Validation cho DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 2. Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Bat Trang Ceramics API')
    .setDescription('API Bán gốm sứ Bát Tràng')
    .setVersion('1.0')
    .addBearerAuth() // Nút nhập Token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 3. Cho phép Frontend (sau này) gọi API
  app.enableCors(); 

  await app.listen(6000);
}
bootstrap();