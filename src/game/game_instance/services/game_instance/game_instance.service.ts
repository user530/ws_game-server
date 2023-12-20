import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameLogicService } from '../game_logic/game_logic.service';
import { GameEventNewTurn, GameEventGameWon, GameEventGameDraw } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameTurnResult } from '@user530/ws_game_shared/enums';

interface IGameInstanceService {
    handleMakeTurnMessage(payload: MakeTurnDTO):
        Promise<GameEventNewTurn | [GameEventNewTurn, GameEventGameWon | GameEventGameDraw]>;
    handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon>;
}

@Injectable()
export class GameInstanceService implements IGameInstanceService {
    constructor(
        private readonly gameLogicService: GameLogicService
    ) { }

    async handleMakeTurnMessage(payload: MakeTurnDTO): Promise<GameEventNewTurn | [GameEventNewTurn, GameEventGameWon | GameEventGameDraw]> {
        try {
            console.log('Handle MakeTurn fired!');

            const { data: turnData } = payload;
            console.log(turnData);

            await this.gameLogicService.registerTurn(turnData);
            const newGameState = await this.gameLogicService.processTurn(turnData);

            const turnResult = this.gameLogicService.lastTurnResult(
                {
                    gameStatus: newGameState.status,
                    gameWinner: newGameState.winner
                }
            );

            const turnMark = this.gameLogicService.lastTurnMark(
                {
                    gameHost: newGameState.host,
                    lastTurn: newGameState.turns.slice(-1)[0]
                }
            );


            if (turnResult === GameTurnResult.Not_Decided)
                return
            if (turnResult === GameTurnResult.Win)
                console.log('Game won');
            else if (turnResult === GameTurnResult.Draw)
                console.log('Game')

            // Game logic service (turnData) => new Game state

            // Game to Events

            // Emit events

            // await this.gameLogicService.registerTurn(turnData);

            // const resultStatus = await this.gameLogicService.processTurn(turnData);         // CHANGE FOR THE PROPER ENUM!

            // const mark = turnData.player_id === 'bfb9551f-ee05-4b69-b19c-e471f81f3e4d' ? 'X' : 'O'; // DELETE THIS CRAP!

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

    handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon> {
        return
    }
}
