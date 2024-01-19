import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { HubEventGameData, HubEventLobbyData } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubCommandHostData, HubCommandJoinData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { Game } from 'src/database/entities';
import { GameService, PlayerService } from 'src/database/services';
import { HubAuthDTO } from '../../dtos';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface IHubLogicService {
    isValidHubConnection(hubAuthDTO: HubAuthDTO): Promise<boolean>;
    getPlayerActiveGame(hubAuthDTO: HubAuthDTO): Promise<Game | undefined>
    getOpenLobbies(): Promise<HubEventGameData[]>;
    getHostedLobby(hostData: HubCommandHostData): Promise<HubEventGameData>;
    getJoinedLobby(joinData: HubCommandJoinData): Promise<HubEventLobbyData>;
}


@Injectable()
export class HubLogicService implements IHubLogicService {
    constructor(
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) { }

    async getPlayerActiveGame(hubAuthDTO: HubAuthDTO): Promise<Game | undefined> {
        console.log('HUB LOGIC - GET PLAYER ACTIVE GAME FIRED');
        const { userId } = hubAuthDTO;
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

    async getJoinedLobby(joinData: HubCommandJoinData): Promise<HubEventLobbyData> {
        const { playerId: guestId, lobbyId: gameId } = joinData;
        const openGame = await this.gameService.joinGame({ guestId, gameId });
        const lobbyData = this.gameToHubLobbyData(openGame);

        return lobbyData;
    }

    async getHostedLobby(hostData: HubCommandHostData): Promise<HubEventGameData> {
        const { playerId: hostId } = hostData;
        const newGame = await this.gameService.hostGame({ hostId });
        const gameData = this.gameToHubGameData(newGame);

        return gameData;
    }

    async getOpenLobbies(): Promise<HubEventGameData[]> {
        const games = await this.getHostedGames();
        const gamesData = games.map((game) => (this.gameToHubGameData(game)));

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

    private gameToHubGameData(game: Game): HubEventGameData {
        const { id: gameId, host: { id: hostId, name: hostName }, guest, status } = game;

        if (guest)
            throw new Error('Hub Game - Guest spot already taken!');

        if (status !== GameStatus.Pending)
            throw new Error('Hub Game - Incorrect status!');

        return { gameId, host: { hostId, hostName }, guest: null, status };
    }
    private gameToHubLobbyData(game: Game): HubEventLobbyData {
        const { id: gameId, host: { id: hostId, name: hostName }, guest: { id: guestId, name: guestName }, status } = game;

        if (status !== GameStatus.Pending)
            throw new Error('Hub Game - Incorrect status!');

        return { gameId, host: { hostId, hostName }, guest: { guestId, guestName }, status }
    }
}
