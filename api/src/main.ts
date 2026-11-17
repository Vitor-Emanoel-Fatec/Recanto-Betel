import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { createValidationException } from './common/validation-exception.factory.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()) ?? false,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: createValidationException,
  }));
  await app.listen(process.env.PORT || 3000);
}
await bootstrap();
