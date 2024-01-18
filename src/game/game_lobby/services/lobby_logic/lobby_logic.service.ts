import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { GameService, PlayerService } from 'src/database/services';
import { LobbyAuthData } from '../../dtos/lobby_auth.dto';
import { Game } from 'src/database/entities';
import { LobbyGameData } from '../../dtos/lobby_data.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface ILobbyLogicService {
    validateLobbyConnection(authData: LobbyAuthData): Promise<LobbyGameData>;
}

@Injectable()
export class LobbyLogicService implements ILobbyLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) { }

    async validateLobbyConnection(authData: LobbyAuthData): Promise<LobbyGameData> {
        console.log('VALIDATE LOBBY SERVICE FIRED'); console.log(authData);
        const authDTO = plainToClass(LobbyAuthData, authData);
        const errors = await validate(authDTO);
        if (errors.length > 0)
            throw new UnauthorizedException('Invalid lobby credentials!');

        const game = await this.lobbyGetGame(authData);

        return this.lobbyGameToGameData(game);
    }

    private lobbyGameToGameData(game: Game): LobbyGameData {
        const { id: gameId, host: { id: hostId, name: hostName }, guest, status } = game;

        return guest
            ? { gameId, host: { hostId, hostName }, guest: { guestId: guest.id, guestName: guest.name }, status }
            : { gameId, host: { hostId, hostName }, guest: null, status };
    }

    private async lobbyGetGame(lobbyAuthData: LobbyAuthData): Promise<Game> {
        const { gameId, userId } = lobbyAuthData;
        console.log('LOBBY GET GAME'); console.log(lobbyAuthData);
        const player = await this.playerService.getPlayerById({ id: userId });
        console.log('PLAYER:'); console.log(player);
        if (!player)
            throw new NotFoundException('Player not found!');

        const game = await this.gameService.getGameById({ gameId });
        console.log('GAME:'); console.log(game);
        if (!game)
            throw new NotFoundException('Game not found!');

        if (game.status !== GameStatus.Pending && game.status !== GameStatus.InProgress)
            throw new BadRequestException('Incorrect game status!');
        console.log('Role check:', userId, game.host, game.guest);
        if (game.host.id !== userId && game.guest?.id !== userId)
            throw new UnauthorizedException('Unauthorized player!');

        return game;
    }
}
