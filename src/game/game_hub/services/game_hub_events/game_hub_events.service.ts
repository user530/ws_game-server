import { Injectable } from '@nestjs/common';
import { createErrorEvent, createHubGamesUpdatedEvent, createHubQuitEvent, createHubToLobbyEvent } from '@user530/ws_game_shared/creators/events';
import { ErrorEvent, HubEventGameData, HubEventLobbyData, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameHubEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent;
    prepareGamesUpdatedEvent(gameData: HubEventGameData[]): HubEventGamesUpdated;
    prepareMovedToLobbyEvent(lobbyData: HubEventLobbyData): HubEventMovedToLobby;
    prepareQuitHubEvent(): HubEventQuitHub;
}

@Injectable()
export class GameHubEventsService implements IGameHubEventsService {

    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent {
        return createErrorEvent(errorData);
    }

    prepareGamesUpdatedEvent(hubGames: HubEventGameData[]): HubEventGamesUpdated {
        return createHubGamesUpdatedEvent(hubGames);
    }

    prepareMovedToLobbyEvent(lobbyData: HubEventLobbyData): HubEventMovedToLobby {
        return createHubToLobbyEvent(lobbyData);
    }

    prepareQuitHubEvent(): HubEventQuitHub {
        return createHubQuitEvent();
    }
}
