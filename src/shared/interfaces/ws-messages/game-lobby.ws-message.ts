import { BaseWSMessageType, MessageType } from '../../types';

type LobbyCommandType =
    | 'start_game'
    | 'abort_game'
    | 'kick_guest';

interface BaseLobbyCommandMessage extends BaseWSMessageType {
    type: Extract<MessageType, 'lobby_command'>,
    command: LobbyCommandType,
}

interface LobbyCommandDataType {
    game_id: string,
}

export interface LobbyCommandStartGame extends BaseLobbyCommandMessage {
    command: Extract<LobbyCommandType, 'start_game'>,
    data: Pick<LobbyCommandDataType, 'game_id'>,
}

export interface LobbyCommandAbortGame extends BaseLobbyCommandMessage {
    command: Extract<LobbyCommandType, 'abort_game'>,
    data: Pick<LobbyCommandDataType, 'game_id'>,
}

export interface LobbyCommandKickGuest extends BaseLobbyCommandMessage {
    command: Extract<LobbyCommandType, 'kick_guest'>,
    data: Pick<LobbyCommandDataType, 'game_id'>,
}