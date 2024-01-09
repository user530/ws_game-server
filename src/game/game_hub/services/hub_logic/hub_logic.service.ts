import { Injectable } from '@nestjs/common';
import { HubEventGameData } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubCommandHostData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { Game } from 'src/database/entities';
import { GameService } from 'src/database/services';

interface IHubLogicService {
    getOpenLobbies(): Promise<HubEventGameData[]>
    getHostedGame(hostData: HubCommandHostData): Promise<HubEventGameData>
}


@Injectable()
export class HubLogicService implements IHubLogicService {
    constructor(
        private readonly gameService: GameService,
    ) { }

    async getHostedGame(hostData: HubCommandHostData): Promise<HubEventGameData> {
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
        const { id: gameId, host: { name: hostName } } = game;
        return { gameId, hostName };
    }
}
