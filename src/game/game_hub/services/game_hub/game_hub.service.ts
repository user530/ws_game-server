import { Injectable } from '@nestjs/common';
import { ErrorEvent, HubEventGameData, HubEventLobbyData, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubLogicService } from '../hub_logic/hub_logic.service';
import { GameHubEventsService } from '../game_hub_events/game_hub_events.service';

interface IGameHubService {
    handleConnection(): Promise<HubEventGamesUpdated>;
    handleHostGameMessage(): Promise<string>;
    handleJoinGameMessage(): Promise<string>;
    handleLeaveHubMessage(): Promise<string>;
}

@Injectable()
export class GameHubService implements IGameHubService {
    constructor(
        private readonly hubLogicService: HubLogicService,
        private readonly eventCreatorService: GameHubEventsService
    ) { }

    async handleConnection(): Promise<HubEventGamesUpdated> {

        const gamesData = await this.hubLogicService.getOpenLobbies();

        return this.eventCreatorService.prepareGamesUpdatedEvent(gamesData);
    }

    async handleHostGameMessage(): Promise<string> {
        return 'HUB EVENT - MOVED TO LOBBY TO HOST; HUB EVENT - GAMES UPDATED TO OTHERS';
    }

    async handleJoinGameMessage(): Promise<string> {
        return 'HUB EVENT - MOVED TO LOBBY TO HOST; HUB EVENT - GAMES UPDATED TO OTHERS';
    }

    async handleLeaveHubMessage(): Promise<string> {
        return 'HUB EVENT - QUIT HUB';
    }

}
