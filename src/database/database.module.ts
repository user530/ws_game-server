import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './services/player/player.service';
import { Game, GameTurn, Player } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Player,
        Game,
        GameTurn,
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
