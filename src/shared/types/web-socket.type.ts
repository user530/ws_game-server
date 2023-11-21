import { MakeTurnGameCmd, ForfeitMatchGameCmd } from '../interfaces/game-commands'


export type WebSocketGameCmdMsg = {
    version: 1,
    type: 'game_command',
} &
    (
        MakeTurnGameCmd
        | ForfeitMatchGameCmd
    );

export type WebSocketGameErrMsg = {
    version: 1,
    type: 'error',
    code: number,
    message: string,
}

export type WebSocketChatMsg = {
    version: 1,
    type: 'chat_message',
    sender: string,
    channel: string,
    message: string,
}


