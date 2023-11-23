import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { GameService, GameTurnService } from 'src/database/services';
import { GameCommandDataType } from '@user530/ws_game_shared/interfaces';
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

        const { status, guest: { id: guest_id }, host: { id: host_id }, turns } = game;

        if (status !== GameStatus.InProgress)
            throw new NotAcceptableException('Game is not active!');

        if (player_id !== host_id || player_id !== guest_id)
            throw new UnauthorizedException('Unauthorized user!');

        // Id of the player who made the last move / if first turn we set guest_id as the last player
        const prevTurnPlayer = turns[turns.length - 1]?.player?.id ?? guest_id;

        if (player_id === prevTurnPlayer)
            throw new UnauthorizedException('Unauthorized user!');

        return turns;
    }

    async addTurnToGame(turnData: GameCommandDataType): Promise<GameTurn> {
        return this.gameTurnService.addGameTurn(turnData);
    }

    haveWon(turnData: GameCommandDataType, gameTurns: GameTurn[]): boolean {
        const { player_id, column, row } = turnData;
        // Check row
        const horizontal = gameTurns.filter((turn) => turn.row === row && turn.player.id === player_id);
        if (horizontal.length === 3)
            return true

        // Check column
        const vertical = gameTurns.filter((turn) => turn.column === column && turn.player.id === player_id);
        if (vertical.length === 3)
            return true

        // Check diagonal
        const isDiagonal = column ===  || 

        return
    }
}
