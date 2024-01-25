import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { GameService, PlayerService } from 'src/database/services';
import { Game } from 'src/database/entities';
import { LobbyAuthDTO, LobbyDataDTO, LeaveLobbyDataType, ActiveLobbyDataDTO } from '../../dtos';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface ILobbyLogicService {
    isValidLobbyConnection(authData: LobbyAuthDTO): Promise<LobbyDataDTO>;
    isPlayerHost(leaveLobbyData: LeaveLobbyDataType): Promise<boolean>;
    handleGuestLeave(gameId: string): Promise<void>;
    handleHostLeave(gameId: string): Promise<void>;
    startGame(gameId: string): Promise<ActiveLobbyDataDTO>;
}

@Injectable()
export class LobbyLogicService implements ILobbyLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) { }

    async startGame(gameId: string): Promise<ActiveLobbyDataDTO> {
        console.log('START GAME SERVICE FIRED'); console.log(gameId);

        const startedGame = await this.gameService.updateGameStatus({ gameId, newStatus: GameStatus.InProgress });

        console.log('New active game:'); console.log(startedGame);
        // We started game -> narrow the status type
        const lobbyData = this.gameToLobbyData(startedGame) as ActiveLobbyDataDTO;

        return lobbyData;
    }

    async isValidLobbyConnection(authData: LobbyAuthDTO): Promise<LobbyDataDTO> {
        console.log('VALIDATE LOBBY SERVICE FIRED'); console.log(authData);
        const authDTO = plainToClass(LobbyAuthDTO, authData);
        const errors = await validate(authDTO);
        if (errors.length > 0)
            throw new UnauthorizedException('Invalid lobby credentials!');

        const game = await this.fetchPlayerGame(authData);

        return this.gameToLobbyData(game);
    }

    async isPlayerHost(leaveLobbyData: LeaveLobbyDataType): Promise<boolean> {
        console.log('LOBBY LOGIC - IS PLAYER HOST');
        const { gameId, playerId } = leaveLobbyData;
        const game = await this.gameService.getGameById({ gameId });

        if (!game)
            throw new NotFoundException('Game not found!');
        console.log('IsPlayerHost - Game found'); console.log(game);

        const { host: { id: hostId }, guest } = game;
        if (playerId !== hostId && playerId !== guest?.id)
            throw new UnauthorizedException('Player is not a part of the game!');
        console.log('IsPlayerHost - Player is part of the game. Is host - ', playerId === hostId);
        return playerId === hostId;
    }

    async handleGuestLeave(gameId: string): Promise<void> {
        console.log('LOBBY LOGIC - HANDLE GUEST LEAVE');

        // Clear the guest from the game
        const vacantGame = await this.gameService.kickGuest({ gameId });

        console.log('Handle guest leave, updated game:'); console.log(vacantGame);

        return;
    }

    async handleHostLeave(gameId: string): Promise<void> {
        console.log('LOBBY LOGIC - HANDLE HOST LEAVE');

        // Change game status
        const abortedGame = await this.gameService.updateGameStatus({ gameId, newStatus: GameStatus.Aborted });

        console.log('Handle host leave, updated game:'); console.log(abortedGame);

        return;
    }

    private gameToLobbyData(game: Game): LobbyDataDTO {
        const { id: gameId, host: { id: hostId, name: hostName }, guest, status } = game;

        return guest
            ? { gameId, host: { hostId, hostName }, guest: { guestId: guest.id, guestName: guest.name }, status, turns: [] }
            : { gameId, host: { hostId, hostName }, guest: null, status, turns: [] };
    }

    private async fetchPlayerGame(lobbyAuthData: LobbyAuthDTO): Promise<Game> {
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
