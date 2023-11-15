import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './services/player/player.service';
import { Player } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Player,
      ]
    )
  ],
  providers: [
    PlayerService
  ],
  exports: [
    TypeOrmModule,
    PlayerService
  ],
})
export class DatabaseModule { }
