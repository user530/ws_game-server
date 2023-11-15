import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from 'config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        load: [dbConfig]
      }
    ),
    TypeOrmModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => configService.get<TypeOrmModuleOptions>('database'),
      }
    )

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
