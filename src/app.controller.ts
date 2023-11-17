import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PlayerService, GameTurnService } from './database/services';
import { GameTableCol, GameTableRow } from './shared/enums/game-turn';
import { validate } from 'class-validator';
import { CreateGameTurnDTO } from './database/dtos/game-turn';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService
    private readonly playerService: PlayerService,
    private readonly gameTurnService: GameTurnService
  ) { }

  @Get()
  async getHello() {
    // return this.appService.getHello();
    // console.log(createPlayer);
    // const gameTurn = await this.gameTurnService.getGameTurns({ game_id: 'e4e33ab6-db6f-48ef-bb21-1f828623ebf0' });
    const arg = new CreateGameTurnDTO();
    Object.assign(arg, { game_id: '', player_id: 'qwe', column: GameTableCol.Col_1, row: GameTableRow.Row_1 })
    const valid = await validate(arg);
    console.log(valid);
    const gameTurn = await this.gameTurnService.addGameTurn(arg);

    // const players = await this.playerService.getAllPlayers();
    // const player = await this.playerService.createPlayer({ name: 'Top' });
    // const player = await this.playerService.getPlayerByName({ name: 'Top' });
    // const player = await this.playerService.getPlayerById({ id: '36b7ee9d-543b-466d-97e0-309501e41989' });
    // const player = await this.playerService.updatePlayer({ id: '36b7ee9d-543b-466d-97e0-309501e41989', name: 'Kek' })
    // const player = await this.playerService.deletePlayer({ id: '36b7ee9d-543b-466d-97e0-309501e41989' });

    // return players
    // return player
    return gameTurn
  }
}
