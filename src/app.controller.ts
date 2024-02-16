import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { PlayerService } from './database/services';

@Controller({
  path: 'api/v1/players',
})
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly playerService: PlayerService,
  ) { }

  @Get()
  @HttpCode(200)
  async getPlayers() {
    try {
      console.log('Get players fired!');
      const players = await this.playerService.getAllPlayers();
      return players;
    } catch (error) {
      return error
    }
  }
}
