import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DirectMessage, GeneralMessage, Player } from 'src/database/entities';
import { ChatLayer } from 'src/database/entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(GeneralMessage)
        private readonly generalMsgRepository: Repository<GeneralMessage>,
        @InjectRepository(DirectMessage)
        private readonly directMsgRepository: Repository<DirectMessage>,
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
    ) { }

    async getAllGeneralMessages() {
        console.log('MESSAGE SERVICE - GET ALL GENERAL MESSAGES FIRED!');
        const messages = await this.generalMsgRepository.find({});
        console.log('GENERAL MESSAGES:');
        console.log(messages);
        return messages;
    }

    async getDMsByUser(userId: string) {
        console.log('MESSAGE SERVICE - GET DMs By USER FIRED!');
        const user = await this.playerRepository.findOneBy({ id: userId });

        if (!user) throw new NotFoundException('User is not found!');
        console.log('USER FOUND:'); console.log(user);
        const userDMs = await this.directMsgRepository.findBy([
            { author: { id: user.id } },
            { target: { id: user.id } },
        ]);
        console.log('USER DM-s:'); console.log(userDMs);

        return userDMs;
    }

    async addGeneralMessage(playerId: string, message: string, layer: ChatLayer, channel?: string) {
        console.log('MESSAGE SERVICE - ADD GENERAL MESSAGE FIRED!');
        const author = await this.playerRepository.findOneBy({ id: playerId });

        if (!author) throw new NotFoundException('Author is not found!');
        console.log('AUTHOR FOUND:'); console.log(author);
        const msgDto: any = { author, message, layer };
        if (channel) msgDto.room_id = channel;

        const newMessage = await this.generalMsgRepository.insert(msgDto);
        console.log('New message:'); console.log(newMessage);
        return newMessage;
    }

    async addDirectMessage(playerId: string, message: string, targetId: string) {
        console.log('MESSAGE SERVICE - ADD DIRECT MESSAGE FIRED!');
        const author = await this.playerRepository.findOneBy({ id: playerId });

        if (!author) throw new NotFoundException('Author is not found!');
        console.log('DM AUTHOR FOUND:'); console.log(author);
        const target = await this.playerRepository.findOneBy({ id: targetId });

        if (!target) throw new NotFoundException('Target is not found!');
        console.log('DM TARGET FOUND:'); console.log()
        const dmDto: any = { author, message, target };

        const newDm = await this.directMsgRepository.insert(dmDto);
        console.log('New direct message:'); console.log(newDm);
        return newDm;
    }
}
