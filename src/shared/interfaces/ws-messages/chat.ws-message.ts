import { BaseWSMessageType, MessageType } from '../../types';

export interface ChatMessage extends BaseWSMessageType {
    type: Extract<MessageType, 'chat_message'>,
    user: string,
    channel: string,
    message: string,
}