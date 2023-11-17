import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from 'config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { GameTurnService, PlayerService } from './database/services';
import { GameService } from './src/database/services/game/game.service';

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
    ),
    DatabaseModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    PlayerService,
    GameTurnService,
    GameService,
  ],
})
export class AppModule { }
