import { Module } from '@nestjs/common';
import { GameHubGateway } from './gateways/game_hub/game_hub.gateway';
import { GameHubService } from './services/game_hub/game_hub.service';
import { GameHubEventsService } from './services/game_hub_events/game_hub_events.service';
import { HubLogicService } from './services/hub_logic/hub_logic.service';
import { DatabaseModule } from 'src/database/database.module';
import { GameService, PlayerService } from 'src/database/services';

@Module({
  imports: [DatabaseModule],
  providers: [GameHubGateway, GameHubService, GameHubEventsService, HubLogicService, GameService, PlayerService]
})
export class GameHubModule { }
