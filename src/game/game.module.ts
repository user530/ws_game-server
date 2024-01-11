import { Module } from '@nestjs/common';
import { GameInstanceModule } from './game_instance/game_instance.module';
import { GameHubModule } from './game_hub/game_hub.module';

@Module({
  providers: [],
  imports: [GameInstanceModule, GameHubModule]
})
export class GameModule {
}
