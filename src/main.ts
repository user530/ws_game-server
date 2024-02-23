import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.APP_CORS_ORIGIN || 'http://localhost:3333' });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT || 7000);
}
bootstrap();
