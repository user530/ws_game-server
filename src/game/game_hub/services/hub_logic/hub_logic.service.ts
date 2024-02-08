import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { HubEventLobbyData, HubEventToGameData, HubEventToLobbyData } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubCommandHostData, HubCommandJoinData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { Game } from 'src/database/entities';
import { GameService, PlayerService } from 'src/database/services';
import { HubAuthDTO } from '../../dtos';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';



// DELETE
import { ChatLayer } from 'src/database/entities/message.entity';

interface IHubLogicService {
    isValidHubConnection(hubAuthDTO: HubAuthDTO): Promise<boolean>;
    getPlayerActiveData(hubAuthDTO: HubAuthDTO): Promise<HubEventToLobbyData | HubEventToGameData | undefined>
    getOpenLobbies(): Promise<HubEventLobbyData[]>;
    getHostedLobby(hostData: HubCommandHostData): Promise<HubEventLobbyData>;
    getJoinedLobby(joinData: HubCommandJoinData): Promise<HubEventToLobbyData>;
}


@Injectable()
export class HubLogicService implements IHubLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) { }

    async getPlayerActiveData(hubAuthDTO: HubAuthDTO): Promise<HubEventToLobbyData | HubEventToGameData | null> {
        console.log('HUB LOGIC - GET PLAYER ACTIVE DATA FIRED');
        const { userId } = hubAuthDTO;
        const game = await this.getPlayerActiveGame(userId);

        // No active game
        if (!game) return null;

        const { id: gameId, host: { id: hostId, name: hostName }, guest, status, turns } = game;

        const hostData = { hostId, hostName };

        // If not guest -> Return pending lobby data
        if (!guest)
            return {
                gameId,
                host: hostData,
                guest: null,
                status: GameStatus.Pending,
            } as HubEventToLobbyData;

        // Game has guest, destructure the data
        const guestData = { guestId: guest.id, guestName: guest.name };

        // Return filled lobby data
        if (status === GameStatus.Pending)
            return {
                gameId,
                host: hostData,
                guest: guestData,
                status
            } as HubEventToLobbyData;

        // Return filled game data
        if (status === GameStatus.InProgress)
            return {
                gameId,
                host: hostData,
                guest: guestData,
                status,
                turns: turns.map(
                    ({ player: { id: playerId }, row, column }) => ({ row, column, mark: playerId === hostId ? 'X' : 'O' }))
            } as HubEventToGameData;
    }

    private async getPlayerActiveGame(userId: string): Promise<Game | undefined> {
        console.log('HUB LOGIC - GET PLAYER ACTIVE DATA FIRED');
        const playerGames = await this.getAllGames(userId);
        console.log('All player games fetched');
        console.log(playerGames);
        const activeGame = playerGames
            .find(
                game => game.status === GameStatus.Pending
                    || game.status === GameStatus.InProgress
            );
        console.log('Active game: '); console.log(activeGame);

        return activeGame;
    }

    async isValidHubConnection(hubAuthDTO: HubAuthDTO): Promise<boolean> {
        console.log('HUB LOGIC - IS VALID HUB CONNECTION FIRED');
        const authDTO = plainToClass(HubAuthDTO, hubAuthDTO);
        const errors = await validate(authDTO);
        if (errors.length > 0)
            throw new UnauthorizedException('Invalid player credentials!');
        console.log('isValidHubConnection - DTO validated');
        const player = await this.playerService.getPlayerById({ id: hubAuthDTO.userId });

        if (!player)
            throw new UnauthorizedException('Unauthorized player!');
        console.log('isValidHubConnection - Player exists');
        return true;
    }

    async getJoinedLobby(joinData: HubCommandJoinData): Promise<HubEventToLobbyData> {
        const { playerId: guestId, gameId } = joinData;
        const openGame = await this.gameService.joinGame({ guestId, gameId });
        console.log('HUB LOGIC - GET JOINED LOBBY. GAME:');
        console.log(openGame);
        const lobbyData = this.gameToLobbyGuestData(openGame);

        return lobbyData;
    }

    async getHostedLobby(hostData: HubCommandHostData): Promise<HubEventLobbyData> {
        const { playerId: hostId } = hostData;
        const newGame = await this.gameService.hostGame({ hostId });
        console.log('HUB LOGIC - GET HOSTED LOBBY. GAME:');
        console.log(newGame);
        const gameData = this.gameToLobbyHostData(newGame);

        return gameData;
    }

    async getOpenLobbies(): Promise<HubEventLobbyData[]> {
        const games = await this.getHostedGames();
        const gamesData = games.map((game) => (this.gameToLobbyHostData(game)));

        return gamesData;
    }

    private async getHostedGames(): Promise<Game[]> {
        const games = await this.gameService.getHostedGames();
        return games;
    }

    private async getAllGames(playerId: string): Promise<Game[]> {
        const games = await this.gameService.getAllPlayerGames({ playerId });
        return games;
    }

    private gameToLobbyHostData(game: Game): HubEventLobbyData {

        const { id: gameId, host: { id: hostId, name: hostName }, guest, status } = game;

        if (guest)
            throw new Error('Hub Game - Guest spot already taken!');

        if (status !== GameStatus.Pending)
            throw new Error('Hub Game - Incorrect status!');

        return { gameId, host: { hostId, hostName }, guest: null, status };
    }

    private gameToLobbyGuestData(game: Game): HubEventToLobbyData {
        const { id: gameId, host: { id: hostId, name: hostName }, guest: { id: guestId, name: guestName }, status } = game;

        if (status !== GameStatus.Pending)
            throw new Error('Hub Game - Incorrect status!');

        return { gameId, host: { hostId, hostName }, guest: { guestId, guestName }, status }
    }
}
