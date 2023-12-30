import { Injectable } from '@nestjs/common';
import { createErrorEvent, createNewTurnEvent, createGameWonEvent, createGameDrawEvent } from '@user530/ws_game_shared/creators/events'
import { ErrorEvent, GameEventGameDraw, GameEventGameWon, GameEventNewTurn, GameTurnDataType } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameInstanceEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent;
    prepareNewTurnEvent(newTurnData: GameTurnDataType): GameEventNewTurn;
    prepareGameWonEvent(winnerData: GameEventGameWon['data']): GameEventGameWon;
    prepareGameDrawEvent(): GameEventGameDraw;
}

@Injectable()
export class GameInstanceEventsService implements IGameInstanceEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent {
        return createErrorEvent(errorData);
    }

    prepareNewTurnEvent(newTurnData: GameTurnDataType): GameEventNewTurn {
        return createNewTurnEvent(newTurnData);
    }

    prepareGameWonEvent(winnerData: { player_id: string; }): GameEventGameWon {
        return createGameWonEvent(winnerData);
    }

    prepareGameDrawEvent(): GameEventGameDraw {
        return createGameDrawEvent();
    }
}
