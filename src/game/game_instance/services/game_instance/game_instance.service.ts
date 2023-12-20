import { HttpException, Injectable } from '@nestjs/common';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { GameLogicService } from '../game_logic/game_logic.service';
import { GameEventNewTurn, GameEventGameWon, GameEventGameDraw, ErrorEvent } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameTurnResult } from '@user530/ws_game_shared/enums';
import { GameInstanceEventsService } from '../game_instance_events/game_instance_events.service';

interface IGameInstanceService {
    handleMakeTurnMessage(payload: MakeTurnDTO):
        Promise<GameEventNewTurn | [GameEventNewTurn, GameEventGameWon | GameEventGameDraw] | ErrorEvent>;
    handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon>;
}

@Injectable()
export class GameInstanceService implements IGameInstanceService {
    constructor(
        private readonly gameLogicService: GameLogicService,
        private readonly eventCreatorService: GameInstanceEventsService,
    ) { }

    async handleMakeTurnMessage(payload: MakeTurnDTO): Promise<
        GameEventNewTurn
        | [GameEventNewTurn, GameEventGameWon | GameEventGameDraw]
        | ErrorEvent
    > {
        try {
            console.log('Handle MakeTurn fired!');

            const { data: turnData } = payload;
            console.log(turnData);

            // Add the turn to the game
            await this.gameLogicService.registerTurn(turnData);
            console.log('Turn registered');
            // Update game state depending on the turn
            const newGameState = await this.gameLogicService.processTurn(turnData);
            console.log('Turn processed, new state:', newGameState);
            // Status of the player turn
            const turnResult = this.gameLogicService.lastTurnResult(
                {
                    gameStatus: newGameState.status,
                    gameWinner: newGameState.winner
                }
            );
            console.log('Turn result ', turnResult);
            // Decide the turn mark based on the turn
            const turnMark = this.gameLogicService.lastTurnMark(
                {
                    gameHost: newGameState.host,
                    lastTurn: newGameState.turns.slice(-1)[0]
                }
            );
            console.log('Turn mark ', turnMark);
            // New turn event
            const newTurnEvent = this.eventCreatorService.prepareNewTurnEvent(
                {
                    column: turnData.column,
                    row: turnData.row,
                    mark: turnMark
                }
            );
            console.log('New turn event ', newTurnEvent);
            console.log('Before the if block');
            // Return Event/Events, based on the turn result
            if (turnResult === GameTurnResult.Win) {
                const gameWonEvent = this.eventCreatorService.prepareGameWonEvent({ player_id: turnData.player_id });
                console.log('Game won event ', gameWonEvent);
                return [newTurnEvent, gameWonEvent];
            }
            else if (turnResult === GameTurnResult.Draw) {
                const gameDrawEvent = this.eventCreatorService.prepareGameDrawEvent();
                console.log('Game draw event ', gameDrawEvent);
                return [newTurnEvent, gameDrawEvent];
            }
            else {
                return newTurnEvent;
            }

        } catch (error) {
            console.log('handleMakeTurnMessage - catch block!');

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

    handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon> {
        return
    }
}
