import { Injectable } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { HubEventGameData, HubEventLobbyData } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubCommandHostData, HubCommandJoinData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { Game } from 'src/database/entities';
import { GameService } from 'src/database/services';

interface IHubLogicService {
    getOpenLobbies(): Promise<HubEventGameData[]>
    getHostedLobby(hostData: HubCommandHostData): Promise<HubEventGameData>
    getJoinedLobby(joinData: HubCommandJoinData): Promise<HubEventLobbyData>
}


@Injectable()
export class HubLogicService implements IHubLogicService {
    constructor(
        private readonly gameService: GameService,
    ) { }

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
