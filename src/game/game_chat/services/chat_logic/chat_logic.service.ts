import { Injectable } from '@nestjs/common';
import { ChatEventNewMsgData } from '@user530/ws_game_shared/interfaces/ws-events';
import { CreateDirectMessageDTO, CreateGeneralMessageDTO } from 'src/database/dtos/message';
import { ChatLayer, DirectMessage, GeneralMessage } from 'src/database/entities/message.entity';
import { MessageService } from 'src/database/services';

@Injectable()
export class ChatLogicService {

    constructor(
        private readonly messageService: MessageService,
    ) { }

    async getHubMessages(): Promise<GeneralMessage[]> {
        return await this.messageService.getLayerMessages({ layer: ChatLayer.Hub });
    }

    async getLobbyMessages(roomId: string): Promise<GeneralMessage[]> {
        return await this.messageService.getLayerMessages({ layer: ChatLayer.Lobby, roomId });
    }

    async getGameMessages(roomId: string): Promise<GeneralMessage[]> {
        return await this.messageService.getLayerMessages({ layer: ChatLayer.Game, roomId });
    }

    async getDirectMessages(userId: string): Promise<DirectMessage[]> {
        return await this.messageService.getDMsByUser({ userId });
    }

    async addGeneralMessage(createGeneralMsgDTO: CreateGeneralMessageDTO): Promise<GeneralMessage> {
        const newMessage = await this.messageService.createGeneralMessage(createGeneralMsgDTO);
        return newMessage;
    }

    async addDirectMessage(createDirectMsgDTO: CreateDirectMessageDTO): Promise<DirectMessage> {
        const newDirectMessage = await this.messageService.createDirectMessage(createDirectMsgDTO)
        return newDirectMessage;
    }

    parseDirectMessage(message: string): { target: string, messageTxt: string } {
        const [whisperCmd, target, ...messageWords] = message.split(' ');

        if (!whisperCmd || !target || !messageWords) throw Error('Can\'t parse direct message!');

        if (messageWords.length === 0) throw new Error('Try to add an actual message next time!');

        return { target, messageTxt: messageWords.join(' ') };
    }

    isDirectMessage(message: string): boolean {
        // DM syntax is "/w [target_name] [message]"
        const splitMsg = message.split(' ');

        return splitMsg.length >= 2 && splitMsg[0] === '/w'
    }

    errTxtToEventData(errText: string): ChatEventNewMsgData {
        const eventData: ChatEventNewMsgData = {
            user: 'SERVER',
            message: errText,
            timestamp: this.dateToChatstamp(new Date()),
            isWhisper: true,
        }

        return eventData;
    }

    generalMsgToEventData(generalMsg: GeneralMessage): ChatEventNewMsgData {
        const { author: { name }, message, timestamp } = generalMsg;

        return {
            user: name,
            message,
            timestamp: this.dateToChatstamp(timestamp),
            isWhisper: false
        };
    }

    directMsgToEventData(directMsg: DirectMessage): ChatEventNewMsgData {
        const { author: { name }, message, timestamp } = directMsg;

        return {
            user: name,
            message,
            timestamp: this.dateToChatstamp(timestamp),
            isWhisper: true
        };
    }

    private dateToChatstamp(date: Date): [number, number] {
        return [date.getHours(), date.getMinutes()];
    }

    chatstampToMins(chatstamp: [number, number]): number {
        return chatstamp[1] + chatstamp[0] * 60;
    }
}
