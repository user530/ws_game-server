import { HttpException, Injectable } from '@nestjs/common';
import { LobbyEventGuestJoined, LobbyEventGuestLeft, LobbyEventMovedToGame, LobbyEventMovedToHub, ErrorEvent } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameLobbyEventsService } from '../game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from '../lobby_logic/lobby_logic.service';
import { LeaveLobbyDTO, LobbyAuthDTO } from '../../dtos';
import { createLobbyGuestJoinedEvent, createLobbyGuestLeftEvent, createLobbyToGameEvent, createLobbyToHubEvent } from '@user530/ws_game_shared/creators/events';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { LeaveLobbyDataType } from '../../dtos/leave_lobby.dto';

interface IGameLobbyService {
    handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventMovedToGame | LobbyEventGuestJoined | [ErrorEvent, LobbyEventMovedToHub]>;
    handleLeaveLobbyMessage(leaveData: LeaveLobbyDataType): Promise<LobbyEventMovedToHub | [LobbyEventMovedToHub, LobbyEventGuestLeft] | ErrorEvent>;
    handleKickGuestMessage(): Promise<void>;
    handleStartGameMessage(): Promise<void>;
}

@Injectable()
export class GameLobbyService implements IGameLobbyService {

    constructor(
        private readonly eventCreatorService: GameLobbyEventsService,
        private readonly lobbyLogicService: LobbyLogicService,
    ) { }

    async handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventMovedToGame | LobbyEventGuestJoined | [ErrorEvent, LobbyEventMovedToHub]> {
        console.log('Game Lobby Service - Handle Connection Fired');
        try {
            // Validate and get lobby data
            const { gameId, guest, host, status, turns } = await this.lobbyLogicService.isValidLobbyConnection(authData);

            console.log('Handle connection, validated game data');
            console.log({ gameId, guest, host, status, turns });

            // If player is already part of the active game
            if (status === GameStatus.InProgress)
                return createLobbyToGameEvent({ gameId, guest, host, status, turns });

            // Here the game is still a pending lobby, check if connected player is a guest
            if (guest && guest.guestId === authData.userId)
                return createLobbyGuestJoinedEvent({ ...guest })

            // Host connected, return null
            return null
        } catch (error) {
            // Default err object
            const errObject = { status: 500, message: 'Something went wrong' };

            // Reset error data if the error is recognised
            if (error instanceof HttpException) {
                errObject.status = error.getStatus();
                errObject.message = error.message;
            }

            return [
                this.eventCreatorService.prepareErrorEvent({ code: errObject.status, message: errObject.message }),
                this.eventCreatorService.prepareMovedToHubEvent()
            ];
        }
    }

    async handleLeaveLobbyMessage(leaveData: LeaveLobbyDataType): Promise<LobbyEventMovedToHub | [LobbyEventMovedToHub, LobbyEventGuestLeft] | ErrorEvent> {
        try {
            console.log('Game Lobby Service - Handle Leave Lobby Message Fired');
            const { gameId, playerId } = leaveData;
            console.log(`GameId: ${gameId}, playerId: ${playerId}`);
            const isHost = await this.lobbyLogicService.isPlayerHost(leaveData);
            console.log('Handle leave message, is host - ', isHost);
            // If user is host -> Abort the game, emit to both: Move to Hub event
            if (isHost) {
                await this.lobbyLogicService.handleHostLeave(gameId);
                return createLobbyToHubEvent();
            }
            // If user is guest -> Update the game (guest is null), Update New Lobby Status to host, Emit to guest Move to Hub, Emit updated game list to Hub(!) 
            else {
                await this.lobbyLogicService.handleGuestLeave(gameId);
                // NEED SOME WAY TO EMIT UPDATED GAME LIST IN THE HUB! (Maybe add some update msg listener to the hub and emit from the lobby gateway to the hub one)
                return [
                    createLobbyToHubEvent(),
                    createLobbyGuestLeftEvent(),
                ]
            }
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

    async handleKickGuestMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Kick Guest Message Fired');
        return
    }

    async handleStartGameMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Start Game Message Fired');
        return
    }
}
