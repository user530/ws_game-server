import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { GameService, PlayerService } from 'src/database/services';

interface ILobbyLogicService {
    lobbyGetPlayerRole({ gameId, playerId }: { gameId: string, playerId: string }): Promise<'host' | 'guest'>
}

@Injectable()
export class LobbyLogicService implements ILobbyLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) { }

    async lobbyGetPlayerRole({ gameId, playerId }: { gameId: string; playerId: string; }): Promise<'host' | 'guest'> {
        const player = await this.playerService.getPlayerById({ id: playerId });

        if (!player)
            throw new NotFoundException('Player not found!');

        const game = await this.gameService.getGameById({ gameId });

        if (!game)
            throw new NotFoundException('Game not found!');

        if (game.status !== GameStatus.Pending)
            throw new BadRequestException('Incorrect game status!');

        if (game.host.id !== playerId || game.guest?.id !== playerId)
            throw new UnauthorizedException('Unauthorized player!');

        return game.host.id === playerId ? 'host' : 'guest';
    }
}
