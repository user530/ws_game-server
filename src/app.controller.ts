import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PlayerService } from './database/services';
import { CreatePlayerDTO, ResponsePlayerDTO } from './database/dtos/players';

@Controller({
  path: 'api/v1/players',
})
export class AppController {
  constructor(
    private readonly playerService: PlayerService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPlayers(): Promise<ResponsePlayerDTO[]> {
    try {
      const players = await this.playerService.getAllPlayers();

      const dtos: ResponsePlayerDTO[] = players.map(({ id, name }) => ({ id, name }));

      return dtos;
    } catch (error) {
      throw error
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPlayer(@Body() createPlayerDTO: CreatePlayerDTO): Promise<ResponsePlayerDTO> {
    try {
      console.log('CREATE PLAYER FIRED!');
      const { name } = createPlayerDTO;

      const newPlayer = await this.playerService.createPlayer({ name });

      const { id } = newPlayer;

      return { id, name }
    } catch (error) {
      throw error
    }
  }
}
