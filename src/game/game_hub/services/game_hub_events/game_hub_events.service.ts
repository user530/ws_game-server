import { Injectable } from '@nestjs/common';
import { createErrorEvent, createHubGamesUpdatedEvent, createHubQuitEvent, createHubToGameEvent, createHubToLobbyEvent } from '@user530/ws_game_shared/creators/events';
import { ErrorEvent, HubEventLobbyData, HubEventToLobbyData, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub, HubEventToGameData, HubEventMovedToGame } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameHubEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent;
    prepareGamesUpdatedEvent(gameData: HubEventLobbyData[]): HubEventGamesUpdated;
    prepareMovedToLobbyEvent(lobbyData: HubEventToLobbyData): HubEventMovedToLobby;
    prepareMovedToGameEvent(gameData: HubEventToGameData): HubEventMovedToGame;
    prepareQuitHubEvent(): HubEventQuitHub;
}

@Injectable()
export class GameHubEventsService implements IGameHubEventsService {

    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent {
        return createErrorEvent(errorData);
    }

    prepareGamesUpdatedEvent(hubGames: HubEventLobbyData[]): HubEventGamesUpdated {
        return createHubGamesUpdatedEvent(hubGames);
    }

    prepareMovedToLobbyEvent(lobbyData: HubEventToLobbyData): HubEventMovedToLobby {
        return createHubToLobbyEvent(lobbyData);
    }

    prepareMovedToGameEvent(gameData: HubEventToGameData): HubEventMovedToGame {
        return createHubToGameEvent(gameData);
    }

    prepareQuitHubEvent(): HubEventQuitHub {
        return createHubQuitEvent();
    }
}
