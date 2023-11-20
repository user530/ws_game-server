import { Module } from '@nestjs/common';
import { GameInstanceService } from './services/game_instance.service';
import { GameInstanceGateway } from './gateways/game_instance.gateway';

@Module({
  providers: [GameInstanceService, GameInstanceGateway]
})
export class GameInstanceModule { }
