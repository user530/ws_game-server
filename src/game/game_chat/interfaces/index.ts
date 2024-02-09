import { ChatEventNewMessage } from '@user530/ws_game_shared/interfaces/ws-events';
import { ChatCommandSendMsgData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { ChatLayer } from 'src/database/entities/message.entity';

export interface LayerMessage {
    msgData: ChatCommandSendMsgData,
    contextData: {
        layer: ChatLayer,
        roomId: string
    },
}

export interface TargetedEvent {
    event: ChatEventNewMessage,
    targets: string[],
}