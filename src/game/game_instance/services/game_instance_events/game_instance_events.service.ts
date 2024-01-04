import { Injectable } from '@nestjs/common';
import { createErrorEvent, createInstanceNewTurnEvent, createInstanceGameWonEvent, createInstanceGameDrawEvent } from '@user530/ws_game_shared/creators/events'
import { ErrorEvent, GameEventGameDraw, GameEventGameWon, GameEventNewTurn, GameEventTurnData, GameEventWinnerData } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameInstanceEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent;
    prepareNewTurnEvent(newTurnData: GameEventTurnData): GameEventNewTurn;
    prepareGameWonEvent(winnerData: GameEventWinnerData): GameEventGameWon;
    prepareGameDrawEvent(): GameEventGameDraw;
}

@Injectable()
export class GameInstanceEventsService implements IGameInstanceEventsService {
    prepareErrorEvent(errorData: Pick<ErrorEvent, 'code' | 'message'>): ErrorEvent {
        return createErrorEvent(errorData);
    }

    prepareNewTurnEvent(newTurnData: GameEventTurnData): GameEventNewTurn {
        return createInstanceNewTurnEvent(newTurnData);
    }

    prepareGameWonEvent(winnerData: GameEventWinnerData): GameEventGameWon {
        return createInstanceGameWonEvent(winnerData);
    }

    prepareGameDrawEvent(): GameEventGameDraw {
        return createInstanceGameDrawEvent();
    }
}
