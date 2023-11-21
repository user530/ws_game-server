import { BaseWSMessageType, GameCommandType, MessageType } from '../../types';
import { GameTableCol, GameTableRow } from '../../enums/game-turn';

interface BaseGameCommandMessage extends BaseWSMessageType {
    type: Extract<MessageType, 'game_command'>,
    command: GameCommandType,
}

export interface GameCommandDataType {
    game_id: string,
    player_id: string,
    row: GameTableRow,
    column: GameTableCol,
}

export interface GameCommandMakeTurn extends BaseGameCommandMessage {
    command: Extract<GameCommandType, 'make_turn'>,
    data: GameCommandDataType,
}

export interface GameCommandForfeit extends BaseGameCommandMessage {
    command: Extract<GameCommandType, 'forfeit_match'>,
    data: Pick<GameCommandDataType, 'game_id' | 'player_id'>,
}