import { HttpException, Injectable } from '@nestjs/common';
import { LobbyEventGuestJoined, LobbyEventGuestLeft, LobbyEventMovedToGame, LobbyEventMovedToHub, ErrorEvent } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameLobbyEventsService } from '../game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from '../lobby_logic/lobby_logic.service';
import { LobbyAuthDTO } from '../../dtos';
import { createLobbyGuestJoinedEvent } from '@user530/ws_game_shared/creators/events';

interface IGameLobbyService {
    handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventGuestJoined | ErrorEvent>;
    handleLeaveLobbyMessage(): Promise<void>;
    handleKickGuestMessage(): Promise<void>;
    handleStartGameMessage(): Promise<void>;
}

@Injectable()
export class GameLobbyService implements IGameLobbyService {

    constructor(
        private readonly eventCreatorService: GameLobbyEventsService,
        private readonly lobbyLogicService: LobbyLogicService,
    ) { }

    async handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventGuestJoined | ErrorEvent> {
        console.log('Game Lobby Service - Handle Connection Fired');
        try {
            // Validate and get lobby data
            const gameData = await this.lobbyLogicService.validateLobbyConnection(authData);
            console.log('Handle connection, validated game data');
            console.log(gameData);
            // If connected player is a guest, prepare event
            if (gameData.guest && gameData.guest.guestId === authData.userId)
                return createLobbyGuestJoinedEvent({ ...gameData.guest })

            // Host connected, return null
            else return null
        } catch (error) {
            // Default err object
            const errObject = { status: 500, message: 'Something went wrong' };

            // Reset error data if the error is recognised
            if (error instanceof HttpException) {
                errObject.status = error.getStatus();
                errObject.message = error.message;
            }

            return this.eventCreatorService.prepareErrorEvent({ code: errObject.status, message: errObject.message });
        }
    }

    async handleLeaveLobbyMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Leave Lobby Message Fired');
        return
    }

    async handleKickGuestMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Kick Guest Message Fired');
        return
    }

    async handleStartGameMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Start Game Message Fired');
        return
    }
}
