import { Injectable } from '@nestjs/common';
import { ChatLogicService } from '../chat_logic/chat_logic.service';
import { GameChatEventsService } from '../game_chat_events/game_chat_events.service';
import { ChatEventNewMessage, ChatEventNewMsgData } from '@user530/ws_game_shared/interfaces/ws-events';
import { GeneralMessage } from 'src/database/entities';
import { ChatCommandSendMsgData } from '@user530/ws_game_shared/interfaces/ws-messages';

interface IGameChatService {
    handleHubConnection(): Promise<ChatEventNewMessage[]>;
    handleLobbyConnection(lobbyRoomId: string): Promise<ChatEventNewMessage[]>;
    handleGameConnection(gameRoomId: string): Promise<ChatEventNewMessage[]>;
    handleSendMsgMessage(payload: any): Promise<ErrorEvent | ChatEventNewMessage>;
}

@Injectable()
export class GameChatService implements IGameChatService {

    constructor(
        private readonly chatLogicService: ChatLogicService,
        private readonly eventCreatorService: GameChatEventsService,
    ) { }

    async handleHubConnection(): Promise<ChatEventNewMessage[]> {
        try {
            console.log('GAME CHAT SERVICE - HANDLE HUB CONNECTION FIRED!');

            const messages = await this.chatLogicService.getHubMessages();

            return messages
                .map(
                    msg => this.eventCreatorService
                        .prepareNewMessageEvent(
                            this.generalMsgToEventData(msg)
                        ));

        } catch (error) {
            console.log('CHAT SERVICE - HANDLE HUB ERROR!');
            console.log(error);
        }
    }

    async handleLobbyConnection(lobbyRoomId: string): Promise<ChatEventNewMessage[]> {
        console.log('GAME CHAT SERVICE - HANDLE LOBBY CONNECTION FIRED!');
        return [];
    }

    async handleGameConnection(gameRoomId: string): Promise<ChatEventNewMessage[]> {
        console.log('GAME CHAT SERVICE - HANDLE GAME CONNECTION FIRED!');
        return [];
    }

    async handleSendMsgMessage(payload: ChatCommandSendMsgData): Promise<ErrorEvent | ChatEventNewMessage> {
        console.log('GAME CHAT SERVICE - HANDLE SEND MSG MESSAGE FIRED!');
        const { user, message } = payload;

        // Check if message is DM or general one
        // If it is DM -> getTarget from the message text
        // Try to add DM
        // Return DM event

        // If general message
        // this.chatLogicService

        return
    }

    private generalMsgToEventData(generalMsg: GeneralMessage): ChatEventNewMsgData {
        const { author: { name }, message, timestamp } = generalMsg;
        return {
            user: name,
            message,
            timestamp: [timestamp.getHours(), timestamp.getMinutes()],
            isWhisper: false
        };
    }
}
