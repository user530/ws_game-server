import { HttpException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameLogicService } from '../game_logic/game_logic.service';
import { GameEmitterService } from '../game_emitter/game_emitter.service';

interface IGameInstanceService {
    handleMakeTurnMessage(socket: Socket, client: Socket, payload: MakeTurnDTO): Promise<void>;
    handleForfeitMessage(client: Socket, payload: ForfeitMatchDTO): Promise<void>;
}

@Injectable()
export class GameInstanceService implements IGameInstanceService {
    constructor(
        private readonly gameLogicService: GameLogicService,
        private readonly gameEmitterService: GameEmitterService,
    ) { }

    async handleMakeTurnMessage(
        socket: Socket,
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: MakeTurnDTO): Promise<void> {

        console.log('Handle MakeTurn fired!');
        console.log(`User ${client.id} made a turn`);
        const { data: turnData } = payload;
        console.log(turnData);

        try {
            // Game logic service (turnData) => new Game state

            // Game to Events

            // Emit events

            await this.gameLogicService.registerTurn(turnData);

            const resultStatus = await this.gameLogicService.processTurn(turnData);         // CHANGE FOR THE PROPER ENUM!

            const mark = turnData.player_id === 'bfb9551f-ee05-4b69-b19c-e471f81f3e4d' ? 'X' : 'O'; // DELETE THIS CRAP!

            // CREATE MESSAGES

            // EMITTER SERVICE - EMIT MESSAGES

            // socket.emit('new_turn', { ...turnData, mark })


            // if (resultStatus === GameStatus.Completed)
            //     socket.emit('game_over_win', turnData.player_id);
            // else if (resultStatus === GameStatus.Aborted)
            //     socket.emit('game_over_draw');

        } catch (error) {
            console.log('handleMakeTurnMessage - catch block!');
            // Create err event 
            // Emit event
            // if (error instanceof HttpException) {
            //     const err = error as HttpException

            //     this.emitError(client, createErrorMessage({ code: err.getStatus(), message: err.message }));
            // }
            // else
            //     this.emitError(client, createErrorMessage({ code: 505, message: error.message }));
        }
    }

    handleForfeitMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: ForfeitMatchDTO): Promise<void> {
        return
    }
}
