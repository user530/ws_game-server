import { Module } from '@nestjs/common';
import { GameInstanceService } from './services/game_instance.service';
import { GameInstanceGateway } from './gateways/game_instance.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { GameService, GameTurnService } from 'src/database/services';

@Module({
  imports: [DatabaseModule],
  providers: [GameInstanceService, GameInstanceGateway, GameTurnService, GameService]
})
export class GameInstanceModule { }
