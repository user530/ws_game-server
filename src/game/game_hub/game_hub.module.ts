import { Module } from '@nestjs/common';
import { GameHubGateway } from './gateways/game_hub/game_hub.gateway';
import { GameHubService } from './services/game_hub/game_hub.service';

@Module({
  providers: [GameHubGateway, GameHubService]
})
export class GameHubModule { }
