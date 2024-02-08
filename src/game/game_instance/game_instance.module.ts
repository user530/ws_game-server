import { Module } from '@nestjs/common';
import { GameInstanceService } from './services/game_instance/game_instance.service';
import { GameInstanceGateway } from './gateways/game_instance.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { GameLogicService } from './services/game_logic/game_logic.service';
import { GameInstanceEventsService } from './services/game_instance_events/game_instance_events.service';
import { GameInstanceGuard } from './guards/game_instance/game_instance.guard';

@Module({
  imports: [DatabaseModule],
  providers: [
    GameInstanceGateway,
    GameInstanceGuard,
    GameInstanceService,
    GameLogicService,
    GameInstanceEventsService,
  ]
})
export class GameInstanceModule { }
