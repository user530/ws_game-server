import { Module } from '@nestjs/common';
import { GameInstanceService } from './services/game_instance/game_instance.service';
import { GameInstanceGateway } from './gateways/game_instance.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { GameService, GameTurnService } from 'src/database/services';
import { GameLogicService } from './services/game_logic/game_logic.service';

@Module({
  imports: [DatabaseModule],
  providers: [GameInstanceService, GameInstanceGateway, GameTurnService, GameService, GameLogicService]
})
export class GameInstanceModule { }
