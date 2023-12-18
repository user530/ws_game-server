import { HttpException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ErrorMessage, GameCommandDataType } from '@user530/ws_game_shared/interfaces';
import { createErrorMessage } from '@user530/ws_game_shared/creators';
import { GameLogicService } from '../game_logic/game_logic.service';
import { GameStatus } from '@user530/ws_game_shared/enums';

interface IGameInstanceService {
    handleMakeTurnMessage(socket: Socket, client: Socket, payload: MakeTurnDTO): Promise<void>;
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
        socket: Socket,
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: MakeTurnDTO): Promise<void> {

        console.log('Handle MakeTurn fired!');
        console.log(`User ${client.id} made a turn`);
        const { data: turnData } = payload;
        console.log(turnData);

        try {
            await this.gameLogicService.registerTurn(turnData);

            const resultStatus = await this.gameLogicService.processTurn(turnData);         // CHANGE FOR THE PROPER ENUM!

            socket.emit('new_turn', turnData)

            if (resultStatus === GameStatus.Completed)
                socket.emit('game_over_win', turnData.player_id);
            else if (resultStatus === GameStatus.Aborted)
                socket.emit('game_over_draw');

        } catch (error) {
            console.log('handleMakeTurnMessage - catch block!');
            if (error instanceof HttpException) {
                const err = error as HttpException
                this.emitError(client, createErrorMessage({ code: err.getStatus(), message: err.message }));
            }
            else
                this.emitError(client, createErrorMessage({ code: 505, message: error.message }));
        }
    }

    handleForfeitMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: ForfeitMatchDTO): Promise<void> {
        return
    }
}
