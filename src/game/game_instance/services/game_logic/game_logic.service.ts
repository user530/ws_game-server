import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus, GameFieldSquare } from '@user530/ws_game_shared/enums';
import { GameCommandDataType } from '@user530/ws_game_shared/interfaces';
import { getGridSquare } from '@user530/ws_game_shared/helpers';
import { Game, GameTurn } from 'src/database/entities';
import { CreateGameTurnDTO } from 'src/database/dtos/game-turn';


@Injectable()
export class GameLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly gameTurnService: GameTurnService,
    ) { }

    async addTurnToGame(createGameTurnDTO: CreateGameTurnDTO): Promise<void> {
        await this.gameTurnService.addGameTurn(createGameTurnDTO);
    }

    async playerWon(turnData: GameCommandDataType): Promise<boolean> {
        console.log('Checking win condition');
        const { game_id, player_id, column, row } = turnData;
        console.log(turnData)
        const game = await this.gameService.getGameById({ game_id });
        console.log(game);
        if (!game)
            throw new NotFoundException('Game is not found!');

        const { turns } = game;
        console.log(turns)

        // Check row
        const horizontal = turns.filter((turn) => turn.row === row && turn.player?.id === player_id);
        console.log('Horizontal ', horizontal)
        if (horizontal.length === 3)
            return true

        // Check column
        const vertical = turns.filter((turn) => turn.column === column && turn.player?.id === player_id);
        console.log('Vertical ', vertical)
        if (vertical.length === 3)
            return true

        // Check diagonals
        const diagonal1 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_1, GameFieldSquare.Square_5, GameFieldSquare.Square_9].includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);
        const diagonal2 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_3, GameFieldSquare.Square_5, GameFieldSquare.Square_7].includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);

        console.log('Diagonal1 ', diagonal1)
        console.log('Diagonal2 ', diagonal2)

        if (diagonal1.length === 3 || diagonal2.length === 3)
            return true;

        return false;
    }
}
