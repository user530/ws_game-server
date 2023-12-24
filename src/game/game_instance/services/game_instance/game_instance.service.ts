import { HttpException, Injectable } from '@nestjs/common';
import { MakeTurnDTO, ForfeitMatchDTO } from '../../dtos';
import { GameLogicService } from '../game_logic/game_logic.service';
import { GameEventNewTurn, GameEventGameWon, GameEventGameDraw, ErrorEvent } from '@user530/ws_game_shared/interfaces/ws-events';
import { GameTurnResult } from '@user530/ws_game_shared/enums';
import { GameInstanceEventsService } from '../game_instance_events/game_instance_events.service';

interface IGameInstanceService {
    handleMakeTurnMessage(payload: MakeTurnDTO):
        Promise<GameEventNewTurn | [GameEventNewTurn, GameEventGameWon | GameEventGameDraw] | ErrorEvent>;
    handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon | ErrorEvent>;
    handleConnection(gameId: string): Promise<GameEventNewTurn[] | ErrorEvent>;
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
            const { data: turnData } = payload;

            // Add the turn to the game
            await this.gameLogicService.registerTurn(turnData);

            // Update game state depending on the turn
            const newGameState = await this.gameLogicService.processTurn(turnData);

            // Status of the player turn
            const turnResult = this.gameLogicService.lastTurnResult(
                {
                    gameStatus: newGameState.status,
                    gameWinner: newGameState.winner
                }
            );

            // Decide the turn mark based on the turn
            const turnMark = this.gameLogicService.lastTurnMark(
                {
                    gameHost: newGameState.host,
                    lastTurn: newGameState.turns.slice(-1)[0]
                }
            );

            // New turn event
            const newTurnEvent = this.eventCreatorService.prepareNewTurnEvent(
                {
                    column: turnData.column,
                    row: turnData.row,
                    mark: turnMark
                }
            );

            // Return Event/Events, based on the turn result
            if (turnResult === GameTurnResult.Win) {
                const gameWonEvent = this.eventCreatorService.prepareGameWonEvent({ player_id: turnData.player_id });

                return [newTurnEvent, gameWonEvent];
            }
            else if (turnResult === GameTurnResult.Draw) {
                const gameDrawEvent = this.eventCreatorService.prepareGameDrawEvent();

                return [newTurnEvent, gameDrawEvent];
            }
            else {
                return newTurnEvent;
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

    async handleForfeitMessage(payload: ForfeitMatchDTO): Promise<GameEventGameWon | ErrorEvent> {
        try {
            const { data } = payload;

            const newGameState = await this.gameLogicService.processForfeit(data);

            const gameWonEvent = this.eventCreatorService.prepareGameWonEvent({ player_id: newGameState.winner.id });

            return gameWonEvent;
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

    async handleConnection(gameId: string): Promise<GameEventNewTurn[] | ErrorEvent> {
        try {
            console.log('Game instance - Handle connection');
            const gameTurnsData = await this.gameLogicService.getGameTurns(gameId);
            console.log('Game turns data: ');
            console.log(gameTurnsData);
            const newTurnEvents = gameTurnsData.map(
                newTurnData => this.eventCreatorService.prepareNewTurnEvent(newTurnData)
            )

            return newTurnEvents;
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
