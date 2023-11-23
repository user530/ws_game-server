import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus, GameFieldSquare } from '@user530/ws_game_shared/enums';
import { GameCommandDataType } from '@user530/ws_game_shared/interfaces';
import { getGridSquare } from '@user530/ws_game_shared/helpers';
import { GameTurn } from 'src/database/entities';


@Injectable()
export class GameLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly gameTurnService: GameTurnService,
    ) { }

    async validateGameTurn(turnData: GameCommandDataType): Promise<GameTurn[]> {

        const { game_id, player_id } = turnData;

        const game = await this.gameService.getGameById({ game_id });

        if (!game)
            throw new NotFoundException('Game not found!');

        if (!game.guest)
            throw new NotAcceptableException('Game is not active!');

        const { status, guest: { id: guest_id }, host: { id: host_id }, turns } = game;

        if (status !== GameStatus.InProgress)
            throw new NotAcceptableException('Game is not active!');

        if (player_id !== host_id && player_id !== guest_id)
            throw new UnauthorizedException('Unauthorized user!');

        // Id of the player who made the last move / if first turn we set guest_id as the last player
        const prevTurnPlayer = turns?.at(-1)?.player?.id ?? guest_id;

        if (player_id === prevTurnPlayer)
            throw new UnauthorizedException('Unauthorized user!');

        return turns;
    }

    async addTurnToGame(turnData: GameCommandDataType): Promise<GameTurn> {
        console.log('ADD GAME TURN FIRED');
        return this.gameTurnService.addGameTurn(turnData);
    }

    playerWon(turnData: GameCommandDataType, gameTurns: GameTurn[]): boolean {
        const { player_id, column, row } = turnData;
        // Check row
        const horizontal = gameTurns.filter((turn) => turn.row === row && turn.player.id === player_id);
        if (horizontal.length === 3)
            return true

        // Check column
        const vertical = gameTurns.filter((turn) => turn.column === column && turn.player.id === player_id);
        if (vertical.length === 3)
            return true

        // Check diagonals
        const diagonal1 = gameTurns.filter(
            (turn) =>
                [GameFieldSquare.Square_1, GameFieldSquare.Square_5, GameFieldSquare.Square_9].includes(getGridSquare(turn.row, turn.column)) && turn.player.id === player_id);
        const diagonal2 = gameTurns.filter(
            (turn) =>
                [GameFieldSquare.Square_3, GameFieldSquare.Square_5, GameFieldSquare.Square_7].includes(getGridSquare(turn.row, turn.column)) && turn.player.id === player_id);

        if (diagonal1.length === 3 || diagonal2.length === 3)
            return true;

        return false;
    }
}
