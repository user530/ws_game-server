import { HttpException, Injectable } from '@nestjs/common';
import { ErrorEvent, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub, HubEventMovedToGame } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubLogicService } from '../hub_logic/hub_logic.service';
import { GameHubEventsService } from '../game_hub_events/game_hub_events.service';
import { HostGameDTO, HubAuthDTO, JoinGameDTO } from '../../dtos';
import { GameStatus } from '@user530/ws_game_shared/enums';

interface IGameHubService {
    handleConnection(hubAuthDTO: HubAuthDTO): Promise<ErrorEvent | HubEventMovedToLobby | HubEventMovedToGame | HubEventGamesUpdated>;
    handleHostGameMessage(payload: HostGameDTO): Promise<ErrorEvent | [HubEventMovedToLobby, HubEventGamesUpdated]>;
    handleJoinGameMessage(payload: JoinGameDTO): Promise<ErrorEvent | [HubEventMovedToLobby, HubEventGamesUpdated]>;
    handleLeaveHubMessage(): Promise<HubEventQuitHub>;
}

@Injectable()
export class GameHubService implements IGameHubService {
    constructor(
        private readonly hubLogicService: HubLogicService,
        private readonly eventCreatorService: GameHubEventsService
    ) { }

    async handleConnection(hubAuthDTO: HubAuthDTO): Promise<ErrorEvent | HubEventMovedToLobby | HubEventMovedToGame | HubEventGamesUpdated> {
        try {
            // Validate user credentials
            await this.hubLogicService.isValidHubConnection(hubAuthDTO);

            // Check if user is already has a lobby or game
            const inProgressData = await this.hubLogicService.getPlayerActiveData(hubAuthDTO);

            // If no game, just send the list of open lobbies
            if (!inProgressData) {
                // If there is no pending or active games -> prepare lobby list for the player
                const gamesData = await this.hubLogicService.getOpenLobbies();

                return this.eventCreatorService.prepareGamesUpdatedEvent(gamesData);
            }

            // If player is the part of some lobby
            if (inProgressData.status === GameStatus.Pending)
                return this.eventCreatorService.prepareMovedToLobbyEvent(inProgressData);

            // Player is the part of some active game
            return this.eventCreatorService.prepareMovedToGameEvent(inProgressData);
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

    async handleHostGameMessage(payload: HostGameDTO): Promise<ErrorEvent | [HubEventMovedToLobby, HubEventGamesUpdated]> {
        try {
            const { data } = payload;

            // Create game and get lobby data
            const lobbyData = await this.hubLogicService.getHostedLobby(data);
            const movedToLobbyEvent = this.eventCreatorService.prepareMovedToLobbyEvent(lobbyData);

            // Get updated lobby list
            const gamesData = await this.hubLogicService.getOpenLobbies();
            const gamesUpdatedEvent = this.eventCreatorService.prepareGamesUpdatedEvent(gamesData);

            return [movedToLobbyEvent, gamesUpdatedEvent];
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

    async handleJoinGameMessage(payload: JoinGameDTO): Promise<ErrorEvent | [HubEventMovedToLobby, HubEventGamesUpdated]> {
        try {
            const { data } = payload;

            // Join game and get lobby data
            const lobbyData = await this.hubLogicService.getJoinedLobby(data);
            const movedToLobbyEvent = this.eventCreatorService.prepareMovedToLobbyEvent(lobbyData);

            // Get updated lobby list
            const gamesData = await this.hubLogicService.getOpenLobbies();
            const gamesUpdatedEvent = this.eventCreatorService.prepareGamesUpdatedEvent(gamesData);

            return [movedToLobbyEvent, gamesUpdatedEvent];
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

    async handleLeaveHubMessage(): Promise<HubEventQuitHub> {
        return this.eventCreatorService.prepareQuitHubEvent();
    }

}
