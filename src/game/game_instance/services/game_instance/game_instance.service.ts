import { HttpException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ErrorMessage } from '@user530/ws_game_shared/interfaces';
import { createErrorMessage } from '@user530/ws_game_shared/creators';
import { GameLogicService } from '../game_logic/game_logic.service';

interface IGameInstanceService {
    handleMakeTurnMessage(client: Socket, payload: MakeTurnDTO): Promise<void>;
    handleForfeitMessage(client: Socket, payload: ForfeitMatchDTO): Promise<void>;
}

@Injectable()
export class GameInstanceService implements IGameInstanceService {
    constructor(
        private readonly gameLogicService: GameLogicService,
    ) { }

    emitError(socketConnection: Socket, errorMessage: ErrorMessage) {
        socketConnection.emit('error', errorMessage);
    }

    async handleMakeTurnMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: MakeTurnDTO): Promise<void> {

        console.log('Handle MakeTurn fired!');
        console.log(`User ${client.id} made a turn`);
        const { data: turnData } = payload;
        console.log(turnData);

        try {
            // const validGame = await this.gameLogicService.validateGameTurn(turnData);
            await this.gameLogicService.addTurnToGame(turnData);

            const playerWon = await this.gameLogicService.playerWon(turnData);

            if (playerWon)
                client.emit('game_over', turnData.player_id);
            else
                client.emit('new_state', turnData);

        } catch (error) {
            if (error instanceof HttpException) {
                const err = error as HttpException
                this.emitError(client, createErrorMessage({ code: err.getStatus(), message: err.message }));
            }
            else
                throw error;
        }
    }

    handleForfeitMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: ForfeitMatchDTO): Promise<void> {
        return
    }
}
