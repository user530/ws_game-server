import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LobbyEventGuestJoined, LobbyEventGuestLeft, LobbyEventMovedToGame, LobbyEventMovedToHub, ErrorEvent, HubEventGamesUpdated } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameLobbyEventsService } from '../game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from '../lobby_logic/lobby_logic.service';
import { KickGuestDataType, LeaveLobbyDataType, LobbyAuthDTO, StartGameDataType } from '../../dtos';
import { createHubGamesUpdatedEvent, createLobbyGuestJoinedEvent, createLobbyGuestLeftEvent, createLobbyToGameEvent, createLobbyToHubEvent } from '@user530/ws_game_shared/creators/events';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { HubLogicService } from 'src/game/game_hub/services/hub_logic/hub_logic.service';

interface IGameLobbyService {
    handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventMovedToGame | LobbyEventGuestJoined | [ErrorEvent, LobbyEventMovedToHub]>;
    handleLeaveLobbyMessage(leaveData: LeaveLobbyDataType): Promise<[LobbyEventMovedToHub, HubEventGamesUpdated] | [LobbyEventMovedToHub, LobbyEventGuestLeft, HubEventGamesUpdated] | ErrorEvent>;
    handleKickGuestMessage(kickData: KickGuestDataType): Promise<[LobbyEventMovedToHub, LobbyEventGuestLeft, HubEventGamesUpdated] | ErrorEvent>;
    handleStartGameMessage(startData: StartGameDataType): Promise<LobbyEventMovedToGame | ErrorEvent>;
}

@Injectable()
export class GameLobbyService implements IGameLobbyService {

    constructor(
        private readonly eventCreatorService: GameLobbyEventsService,
        private readonly lobbyLogicService: LobbyLogicService,
        private readonly hubLogicService: HubLogicService,
    ) { }

    async handleConnection(authData: LobbyAuthDTO): Promise<null | LobbyEventMovedToGame | LobbyEventGuestJoined | [ErrorEvent, LobbyEventMovedToHub]> {
        try {
            // Validate and get lobby data
            const { gameId, guest, host, status, turns } = await this.lobbyLogicService.isValidLobbyConnection(authData);

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

    async handleLeaveLobbyMessage(leaveData: LeaveLobbyDataType): Promise<[LobbyEventMovedToHub, HubEventGamesUpdated] | [LobbyEventMovedToHub, LobbyEventGuestLeft, HubEventGamesUpdated] | ErrorEvent> {
        try {
            const { gameId } = leaveData;

            const isHost = await this.lobbyLogicService.isPlayerHost(leaveData);

            // If user is host -> Abort the game, emit to both: Move to Hub event
            if (isHost) {
                await this.lobbyLogicService.handleHostLeave(gameId);

                // Prepare update event for the users in the hub, signalling that game is not available any more
                const lobbiesData = await this.hubLogicService.getOpenLobbies();

                return [
                    createLobbyToHubEvent(),
                    createHubGamesUpdatedEvent(lobbiesData),
                ];
            }
            // If user is guest -> Update the game (guest is null), Update New Lobby Status to host, Emit to guest Move to Hub, Emit updated game list to Hub(!) 
            else {
                await this.lobbyLogicService.handleGuestLeave(gameId);

                // Prepare update event for the users in the hub, signalling that game is open again
                const lobbiesData = await this.hubLogicService.getOpenLobbies();

                return [
                    createLobbyToHubEvent(),
                    createLobbyGuestLeftEvent(),
                    createHubGamesUpdatedEvent(lobbiesData),
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

    async handleKickGuestMessage(kickData: KickGuestDataType): Promise<[LobbyEventMovedToHub, LobbyEventGuestLeft, HubEventGamesUpdated] | ErrorEvent> {
        try {
            const { gameId } = kickData;

            const isHost = await this.lobbyLogicService.isPlayerHost(kickData);

            // Handle unauthorized user
            if (!isHost) throw new UnauthorizedException('Unauthorized user!');

            // If user is host -> Handle kick (guest leave)
            await this.lobbyLogicService.handleGuestLeave(gameId);

            // Prepare update event for the users in the hub, signalling that game is open again
            const lobbiesData = await this.hubLogicService.getOpenLobbies();

            return [
                createLobbyToHubEvent(),
                createLobbyGuestLeftEvent(),
                createHubGamesUpdatedEvent(lobbiesData),
            ];
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

    async handleStartGameMessage(startData: StartGameDataType): Promise<LobbyEventMovedToGame | ErrorEvent> {
        try {
            const { gameId } = startData;

            const isHost = await this.lobbyLogicService.isPlayerHost(startData);

            // Handle unauthorized user
            if (!isHost) throw new UnauthorizedException('Unauthorized user!');

            // If user is host -> Start game
            const startedGame = await this.lobbyLogicService.startGame(gameId);

            return createLobbyToGameEvent(startedGame);
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
}
