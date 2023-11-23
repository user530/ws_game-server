import { HttpException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus } from '@user530/ws_game_shared/enums';
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
        console.log(payload);

        const { data: turnData } = payload;

        try {
            const prevTurns = await this.gameLogicService.validateGameTurn(turnData);
            const newTurn = await this.gameLogicService.addTurnToGame(turnData);
            const winner = await this.gameLogicService.checkWinner(turn)
        } catch (error) {
            this.emitError(client, createErrorMessage({ error }),);
        }

        // CHECK WIN CONDITION


        // GAME WON -> EMIT END_GAME
        // ELSE -> EMIT GAME_STATE_UPDATED, NEXT_TURN

        console.log(turns)


        return
    }

    handleForfeitMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: ForfeitMatchDTO): Promise<void> {
        return
    }
}
