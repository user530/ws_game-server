import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDirectMessageDTO, CreateGeneralMessage, RequestDmDTO, RequestHubMessageDTO, RequestRoomMessageDTO } from 'src/database/dtos/message';
import { DirectMessage, GeneralMessage, Player } from 'src/database/entities';
import { ChatLayer } from 'src/database/entities/message.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';

interface IMessageService {
    getLayerMessages(requestMessageDTO: RequestHubMessageDTO | RequestRoomMessageDTO): Promise<GeneralMessage[]>
    getDMsByUser(requestDmDTO: RequestDmDTO): Promise<DirectMessage[]>;
    createGeneralMessage(createGeneralMessageDTO: CreateGeneralMessage): Promise<GeneralMessage>;
    createDirectMessage(createDirectMessageDTO: CreateDirectMessageDTO): Promise<DirectMessage>;
}

@Injectable()
export class MessageService implements IMessageService {
    private readonly MESSAGE_LIMIT = 500;
    private readonly TIME_RANGE_MIN = 10;

    constructor(
        @InjectRepository(GeneralMessage)
        private readonly generalMsgRepository: Repository<GeneralMessage>,
        @InjectRepository(DirectMessage)
        private readonly directMsgRepository: Repository<DirectMessage>,
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
    ) { }

    async getLayerMessages(requestMessageDTO: RequestHubMessageDTO | RequestRoomMessageDTO): Promise<GeneralMessage[]> {
        console.log('MESSAGE SERVICE - GET ALL HUB MESSAGES FIRED!');
        console.log(requestMessageDTO);
        const { layer } = requestMessageDTO;

        const timestampLimit = this.getOffsetTimestamp(this.TIME_RANGE_MIN);

        const messages = await this.generalMsgRepository.find(
            {
                where:
                {
                    layer,
                    room_id: layer === ChatLayer.Hub ? null : requestMessageDTO.roomId,
                    // timestamp: MoreThanOrEqual(timestampLimit),
                },
                take: this.MESSAGE_LIMIT,
                order: { timestamp: 'DESC' },
            });

        console.log('MESSAGES:');
        console.log(messages);
        return messages;
    }

    async getDMsByUser(requestDmDTO: RequestDmDTO): Promise<DirectMessage[]> {
        console.log('MESSAGE SERVICE - GET DMs By USER FIRED!');
        console.log(requestDmDTO);
        const { userId } = requestDmDTO;
        const user = await this.playerRepository.findOneBy({ id: userId });

        if (!user) throw new NotFoundException('User is not found!');
        console.log('USER FOUND:'); console.log(user);

        const timestampLimit = this.getOffsetTimestamp(this.TIME_RANGE_MIN);

        const userDMs = await this.directMsgRepository.find({
            where: [
                { author: { id: user.id }, timestamp: MoreThanOrEqual(timestampLimit) },
                { target: { id: user.id }, timestamp: MoreThanOrEqual(timestampLimit) },
            ],
            take: this.MESSAGE_LIMIT,
            order: { timestamp: 'DESC' },
        });

        console.log('USER DM-s:'); console.log(userDMs);

        return userDMs;
    }

    async createGeneralMessage(createGeneralMessageDTO: CreateGeneralMessage): Promise<GeneralMessage> {
        console.log('MESSAGE SERVICE - ADD GENERAL MESSAGE FIRED!');
        const { authorId, message, layer, roomId } = createGeneralMessageDTO;
        const author = await this.playerRepository.findOneBy({ id: authorId });

        if (!author) throw new NotFoundException('Author is not found!');
        console.log('AUTHOR FOUND:'); console.log(author);

        const newMessage = await this.generalMsgRepository.create(
            {
                author,
                message,
                layer,
                room_id: roomId
            });

        console.log('New message:'); console.log(newMessage);
        return await this.generalMsgRepository.save(newMessage);
    }

    async createDirectMessage(createDirectMessageDTO: CreateDirectMessageDTO): Promise<DirectMessage> {
        console.log('MESSAGE SERVICE - ADD DIRECT MESSAGE FIRED!');
        const { authorId, message, targetName } = createDirectMessageDTO;
        const author = await this.playerRepository.findOneBy({ id: authorId });

        if (!author) throw new NotFoundException('Author is not found!');
        console.log('DM AUTHOR FOUND:'); console.log(author);
        const target = await this.playerRepository.findOneBy({ name: targetName });

        if (!target) throw new NotFoundException('Target is not found!');
        console.log('DM TARGET FOUND:'); console.log()

        const newDm = await this.directMsgRepository.create({ author, message, target });
        console.log('New direct message:'); console.log(newDm);
        return await this.directMsgRepository.save(newDm);
    }

    private getOffsetTimestamp(offsetInMinutes: number): Date {
        const timestamp = new Date();
        // Get offset timestamp
        timestamp.setMinutes(timestamp.getMinutes() - offsetInMinutes);

        return timestamp;
    }
}
