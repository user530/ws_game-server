import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.ENV === 'dev')
    app.enableCors({ origin: 'http://localhost:3000' });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();
