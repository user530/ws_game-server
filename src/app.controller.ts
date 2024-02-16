import { Controller, Get, HttpCode } from '@nestjs/common';
import { PlayerService } from './database/services';

@Controller({
  path: 'api/v1/players',
})
export class AppController {
  constructor(
    private readonly playerService: PlayerService,
  ) { }

  @Get()
  @HttpCode(200)
  async getPlayers() {
    try {
      const players = await this.playerService.getAllPlayers();

      return players;
    } catch (error) {
      throw error
    }
  }
}
