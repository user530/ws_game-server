import { Injectable } from '@nestjs/common';
import { createErrorEvent, createLobbyGuestJoinedEvent, createLobbyGuestLeftEvent, createLobbyToGameEvent, createLobbyToHubEvent } from '@user530/ws_game_shared/creators/events';
import { ErrorEvent, LobbyEventGuestJoined, LobbyEventGuestLeft, LobbyEventMovedToGame, LobbyEventMovedToHub, LobbyEventGameData, LobbyEventJoinedData } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameLobbyEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent;
    prepareGuestJoinedEvent(guestData: LobbyEventJoinedData): LobbyEventGuestJoined;
    prepareGuestLeftEvent(): LobbyEventGuestLeft;
    prepareMovedToGameEvent(lobbyData: LobbyEventGameData): LobbyEventMovedToGame;
    prepareMovedToHubEvent(): LobbyEventMovedToHub;
}

@Injectable()
export class GameLobbyEventsService implements IGameLobbyEventsService {

    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent {
        return createErrorEvent(errorData);
    }

    prepareGuestJoinedEvent(guestData: LobbyEventJoinedData): LobbyEventGuestJoined {
        return createLobbyGuestJoinedEvent(guestData);
    }

    prepareGuestLeftEvent(): LobbyEventGuestLeft {
        return createLobbyGuestLeftEvent();
    }

    prepareMovedToGameEvent(lobbyData: LobbyEventGameData): LobbyEventMovedToGame {
        return createLobbyToGameEvent(lobbyData);
    }

    prepareMovedToHubEvent(): LobbyEventMovedToHub {
        return createLobbyToHubEvent();
    }
}
