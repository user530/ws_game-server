import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.ENV === 'dev')
    app.enableCors({ origin: 'http://localhost:3000' })
  await app.listen(5000);
}
bootstrap();
