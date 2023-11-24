import { Injectable, NotFoundException } from '@nestjs/common';
import { GameService, GameTurnService } from 'src/database/services';
import { GameFieldSquare, GameStatus } from '@user530/ws_game_shared/enums';
import { GameCommandDataType } from '@user530/ws_game_shared/interfaces';
import { getGridSquare } from '@user530/ws_game_shared/helpers';
import { CreateGameTurnDTO } from 'src/database/dtos/game-turn';
import { GameTurn } from 'src/database/entities';
import { RequestGameDTO, SetWinnerDTO } from 'src/database/dtos/game';

interface IGameInstanceService {
    registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void>;
    processTurn(turnData: GameCommandDataType): Promise<GameStatus>;
}


@Injectable()
export class GameLogicService implements IGameInstanceService {
    constructor(
        private readonly gameService: GameService,
        private readonly gameTurnService: GameTurnService,
    ) { }

    async registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void> {
        await this.gameTurnService.addGameTurn(createGameTurnDTO);
    }

    async processTurn(turnData: GameCommandDataType): Promise<GameStatus> {
        console.log('Checking win condition');
        const { game_id, player_id } = turnData;

        const game = await this.gameService.getGameById({ game_id });

        if (!game)
            throw new NotFoundException('Game is not found!');

        const { turns } = game;

        const isWin = await this.checkWinCondition(turns, turnData);

        if (isWin) {
            await this.handleWin({ game_id, player_id });
            return GameStatus.Completed;
        }

        const isDraw = await this.checkDrawCondition(turns);

        if (isDraw) {
            await this.handleDraw({ game_id });
            return GameStatus.Aborted;
        }

        return GameStatus.InProgress;
    }

    private async checkWinCondition(turns: GameTurn[], turnData: GameCommandDataType): Promise<boolean> {
        const { player_id, row, column } = turnData;

        // Check the row
        const horizontal = turns.filter((turn) => turn.row === row && turn.player?.id === player_id);
        console.log('Horizontal ', horizontal)
        if (horizontal.length === 3)
            return true;

        // Check the column
        const vertical = turns.filter((turn) => turn.column === column && turn.player?.id === player_id);
        console.log('Vertical ', vertical)
        if (vertical.length === 3)
            return true;

        // Check diagonals
        const diagonal1 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_1, GameFieldSquare.Square_5, GameFieldSquare.Square_9]
                    .includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);

        const diagonal2 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_3, GameFieldSquare.Square_5, GameFieldSquare.Square_7]
                    .includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);

        if (diagonal1.length === 3 || diagonal2.length === 3)
            return true;

        // Game going on
        return false;
    }

    private async checkDrawCondition(turns: GameTurn[]): Promise<GameStatus> {
        if (turns && turns.length === 9)
            return GameStatus.Completed;

        return GameStatus.InProgress;
    }

    private async handleWin(setWinnerDTO: SetWinnerDTO): Promise<void> {
        await this.gameService.updateGameStatus({ game_id: setWinnerDTO.game_id, new_status: GameStatus.Completed });
        await this.gameService.setWinner(setWinnerDTO);
    }

    private async handleDraw(requestGameDTO: RequestGameDTO): Promise<void> {
        await this.gameService.updateGameStatus({ game_id: requestGameDTO.game_id, new_status: GameStatus.Completed });
    }
}
