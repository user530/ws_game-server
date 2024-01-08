import { Injectable } from '@nestjs/common';
import { HubEventGameData } from '@user530/ws_game_shared/interfaces/ws-events';
import { Game } from 'src/database/entities';
import { GameService } from 'src/database/services';

interface IHubLogicService {
    getOpenLobbies(): Promise<HubEventGameData[]>

}


@Injectable()
export class HubLogicService implements IHubLogicService {
    constructor(
        private readonly gameService: GameService,
    ) { }

    private async getHostedGames(): Promise<Game[]> {
        const games = await this.gameService.getHostedGames();
        return games;
    }

    private gamesToHubGameData(games: Game[]): HubEventGameData[] {
        return games.map(({ id, host: { name } }) => ({ gameId: id, hostName: name }));
    }

    async getOpenLobbies(): Promise<HubEventGameData[]> {
        const games = await this.getHostedGames();
        const gamesData = this.gamesToHubGameData(games);

        return gamesData;
    }
}
