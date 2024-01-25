import { Module } from '@nestjs/common';
import { GameInstanceModule } from './game_instance/game_instance.module';
import { GameHubModule } from './game_hub/game_hub.module';
import { GameLobbyModule } from './game_lobby/game_lobby.module';

@Module({
  providers: [],
  imports: [GameInstanceModule, GameHubModule, GameLobbyModule]
})
export class GameModule {
}
