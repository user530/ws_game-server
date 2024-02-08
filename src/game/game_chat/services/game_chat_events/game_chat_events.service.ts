import { Injectable } from '@nestjs/common';
import { createChatNewMsgEvent } from '@user530/ws_game_shared/creators/events';
import { ChatEventNewMessage, ChatEventNewMsgData } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameChatEventsService {
    prepareNewMessageEvent(messageData: ChatEventNewMsgData): ChatEventNewMessage;
}

@Injectable()
export class GameChatEventsService implements IGameChatEventsService {
    prepareNewMessageEvent(messageData: ChatEventNewMsgData): ChatEventNewMessage {
        return createChatNewMsgEvent(messageData);
    }
}
