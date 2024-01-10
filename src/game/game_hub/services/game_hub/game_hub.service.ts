import { HttpException, Injectable } from '@nestjs/common';
import { ErrorEvent, HubEventGameData, HubEventLobbyData, HubEventMovedToLobby, HubEventGamesUpdated, HubEventQuitHub } from '@user530/ws_game_shared/interfaces/ws-events';
import { HubLogicService } from '../hub_logic/hub_logic.service';
import { GameHubEventsService } from '../game_hub_events/game_hub_events.service';
import { HostGameDTO, JoinGameDTO } from '../../dtos';

interface IGameHubService {
    handleConnection(): Promise<HubEventGamesUpdated>;
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

    async handleConnection(): Promise<HubEventGamesUpdated> {

        const gamesData = await this.hubLogicService.getOpenLobbies();

        return this.eventCreatorService.prepareGamesUpdatedEvent(gamesData);
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
