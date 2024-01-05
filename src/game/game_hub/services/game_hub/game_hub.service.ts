import { Injectable } from '@nestjs/common';
import { ErrorEvent, HubEventGameData, HubEventLobbyData, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameHubService {
    handleConnection(): Promise<string>;
    handleHostGameMessage(): Promise<string>;
    handleJoinGameMessage(): Promise<string>;
    handleLeaveHubMessage(): Promise<string>;
}

@Injectable()
export class GameHubService implements IGameHubService {
    async handleConnection(): Promise<string> {
        return 'HUB EVENT - GAMES UPDATED';
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
