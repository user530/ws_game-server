import { BaseWSMessageType, MessageType } from '../../types';

type HubCommandType =
    | 'host_game'
    | 'join_game';

interface BaseHubCommandMessage extends BaseWSMessageType {
    type: Extract<MessageType, 'gamehub_command'>,
    command: HubCommandType,
}

interface HubCommandDataType {
    player_id: string,
    game_id: string,
}

export interface HubCommandHostGame extends BaseHubCommandMessage {
    command: Extract<HubCommandType, 'host_game'>,
    data: Pick<HubCommandDataType, 'player_id'>,
}

export interface HubCommandJoinGame extends BaseHubCommandMessage {
    command: Extract<HubCommandType, 'join_game'>,
    data: HubCommandDataType,
}