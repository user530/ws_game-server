import { Injectable } from '@nestjs/common';
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
        return await this.messageService.getLayerMessages({ layer: ChatLayer.Lobby, roomId });
    }

    async getDirectMessages(userId: string): Promise<DirectMessage[]> {
        return await this.messageService.getDMsByUser({ userId });
    }
}
