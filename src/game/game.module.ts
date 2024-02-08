import { Module } from '@nestjs/common';
import { GameInstanceModule } from './game_instance/game_instance.module';
import { GameHubModule } from './game_hub/game_hub.module';
import { GameLobbyModule } from './game_lobby/game_lobby.module';
import { GameChatModule } from './game_chat/game_chat.module';

@Module({
  providers: [],
  imports: [GameInstanceModule, GameHubModule, GameLobbyModule, GameChatModule]
})
export class GameModule {
}
