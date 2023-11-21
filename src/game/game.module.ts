import { Module } from '@nestjs/common';
import { GameInstanceModule } from './game_instance/game_instance.module';

@Module({
  providers: [],
  imports: [GameInstanceModule]
})
export class GameModule {
}
