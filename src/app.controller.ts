import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PlayerService, GameTurnService } from './database/services';
import { GameTableCol, GameTableRow } from './shared/enums/game-turn';

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
    // const createPlayer = await this.playerService.createPlayer({ name: 'Top' });
    // console.log(createPlayer);
    // const gameTurn = await this.gameTurnService.getGameTurns({ game_id: 'e4e33ab6-db6f-48ef-bb21-1f828623ebf0' });
    const gameTurn = await this.gameTurnService.addGameTurn({ game_id: 'asd', player_id: 'qwe', column: GameTableCol.Col_1, row: GameTableRow.Row_1 });

    // const players = await this.playerService.getAllPlayers();
    // const player = await this.playerService.getPlayerByName({ name: 'Top' });
    // const player = await this.playerService.getPlayerById({ id: 'e4e33ab6-db6f-48ef-bb21-1f828623ebf0' });
    // const player = await this.playerService.updatePlayer({ id: 'e4e33ab6-db6f-48ef-bb21-1f828623ebf0', name: 'Kek' })
    // const player = await this.playerService.deletePlayer({ id: 'e4e33ab6-db6f-48ef-bb21-1f828623ebf0' });


    return gameTurn
  }
}
