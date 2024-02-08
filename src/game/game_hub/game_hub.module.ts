import { Module } from '@nestjs/common';
import { GameHubGateway } from './gateways/game_hub/game_hub.gateway';
import { GameHubService } from './services/game_hub/game_hub.service';
import { GameHubEventsService } from './services/game_hub_events/game_hub_events.service';
import { HubLogicService } from './services/hub_logic/hub_logic.service';
import { DatabaseModule } from 'src/database/database.module';
import { GameChatModule } from '../game_chat/game_chat.module';

@Module({
  imports: [DatabaseModule, GameChatModule],
  providers: [GameHubGateway, GameHubService, GameHubEventsService, HubLogicService]
})
export class GameHubModule { }
