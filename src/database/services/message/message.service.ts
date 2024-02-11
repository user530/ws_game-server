import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDirectMessageDTO, CreateGeneralMessageDTO, RequestDmDTO, RequestHubMessageDTO, RequestRoomMessageDTO } from 'src/database/dtos/message';
import { DirectMessage, GeneralMessage, Player } from 'src/database/entities';
import { ChatLayer } from 'src/database/entities/message.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';

interface IMessageService {
    getLayerMessages(requestMessageDTO: RequestHubMessageDTO | RequestRoomMessageDTO): Promise<GeneralMessage[]>
    getDMsByUser(requestDmDTO: RequestDmDTO): Promise<DirectMessage[]>;
    createGeneralMessage(createGeneralMessageDTO: CreateGeneralMessageDTO): Promise<GeneralMessage>;
    createDirectMessage(createDirectMessageDTO: CreateDirectMessageDTO): Promise<DirectMessage>;
}

@Injectable()
export class MessageService implements IMessageService {
    private readonly MESSAGE_LIMIT = 500;
    private readonly TIME_RANGE_MIN = 60;

    constructor(
        @InjectRepository(GeneralMessage)
        private readonly generalMsgRepository: Repository<GeneralMessage>,
        @InjectRepository(DirectMessage)
        private readonly directMsgRepository: Repository<DirectMessage>,
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
    ) { }

    async getLayerMessages(requestMessageDTO: RequestHubMessageDTO | RequestRoomMessageDTO): Promise<GeneralMessage[]> {
        const { layer } = requestMessageDTO;

        const timestampLimit = this.getOffsetTimestamp(this.TIME_RANGE_MIN);

        const messages = await this.generalMsgRepository.find(
            {
                where:
                {
                    layer,
                    room_id: layer === ChatLayer.Hub ? null : requestMessageDTO.roomId,
                    timestamp: MoreThanOrEqual(timestampLimit),
                },
                take: this.MESSAGE_LIMIT,
                order: { timestamp: 'ASC' },
            });

        return messages;
    }

    async getDMsByUser(requestDmDTO: RequestDmDTO): Promise<DirectMessage[]> {
        const { userId } = requestDmDTO;
        const user = await this.playerRepository.findOneBy({ id: userId });

        if (!user) throw new NotFoundException('User is not found!');

        const timestampLimit = this.getOffsetTimestamp(this.TIME_RANGE_MIN);

        const userDMs = await this.directMsgRepository.find({
            where: [
                { author: { id: user.id }, timestamp: MoreThanOrEqual(timestampLimit) },
                { target: { id: user.id }, timestamp: MoreThanOrEqual(timestampLimit) },
            ],
            take: this.MESSAGE_LIMIT,
            order: { timestamp: 'ASC' },
        });

        return userDMs;
    }

    async createGeneralMessage(createGeneralMessageDTO: CreateGeneralMessageDTO): Promise<GeneralMessage> {
        const { authorId, message, layer, roomId } = createGeneralMessageDTO;
        const author = await this.playerRepository.findOneBy({ id: authorId });

        if (!author) throw new NotFoundException('Author is not found!');

        const newMessage = await this.generalMsgRepository.create(
            {
                author,
                message,
                layer,
                room_id: roomId
            });

        return await this.generalMsgRepository.save(newMessage);
    }

    async createDirectMessage(createDirectMessageDTO: CreateDirectMessageDTO): Promise<DirectMessage> {
        const { authorId, message, targetName } = createDirectMessageDTO;
        const author = await this.playerRepository.findOneBy({ id: authorId });

        if (!author) throw new NotFoundException('Author is not found!');

        const target = await this.playerRepository.findOneBy({ name: targetName });

        if (!target) throw new NotFoundException('Target is not found!');

        if (target.id === author.id) throw new NotAcceptableException('Do you really need a DM to chat with yourself?');

        const newDm = await this.directMsgRepository.create({ author, message, target });

        return await this.directMsgRepository.save(newDm);
    }

    private getOffsetTimestamp(offsetInMinutes: number): Date {
        const timestamp = new Date();
        // Get offset timestamp
        timestamp.setMinutes(timestamp.getMinutes() - offsetInMinutes);

        return timestamp;
    }
}
