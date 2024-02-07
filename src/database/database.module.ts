import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './services/player/player.service';
import { GameTurnService } from './services/game-turn/game-turn.service';
import { DirectMessage, Game, GameTurn, GeneralMessage, Player } from './entities';
import { GameService } from './services/game/game.service';
import { MessageService } from './services/message/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Player,
        Game,
        GameTurn,
        GeneralMessage,
        DirectMessage,
      ]
    )
  ],
  providers: [
    PlayerService,
    GameTurnService,
    GameService,
    MessageService,
  ],
  exports: [
    TypeOrmModule,
    PlayerService
  ],
})
export class DatabaseModule { }
