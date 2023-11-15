import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlayerDTO, RequestPlayerDTO, UpdatePlayerDTO } from 'src/database/dtos/players';
import { Player } from 'src/database/entities/';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>
    ) { }

    async getAllPlayers(): Promise<Player[]> {
        const players: Player[] = await this.playersRepository.find({ order: { id: 'ASC' } });
        return players;
    }

    async getPlayerById(requestPlayerDTO: RequestPlayerDTO): Promise<Player | null> {
        const { id } = requestPlayerDTO;

        const existingUser: Player = await this.playersRepository.findOne(
            {
                where:
                {
                    id
                }
            }
        )

        return existingUser;
    }

    async getPlayerByName(name: string): Promise<Player | null> {
        const existingUser: Player = await this.playersRepository.findOne(
            {
                where:
                {
                    name
                }
            }
        )

        return existingUser;
    }

    async createPlayer(createPlayerDTO: CreatePlayerDTO): Promise<Player> {
        const { name } = createPlayerDTO;
        const existingPlayer: Player | null = await this.getPlayerByName(name);

        if (existingPlayer)
            throw new ConflictException('Player name is already taken!');

        const newPlayer: Player = await this.playersRepository.create(createPlayerDTO);

        return this.playersRepository.save(newPlayer);
    }

    async updatePlayer(id: string, updatePlayerDTO: UpdatePlayerDTO): Promise<Player> {
        const { name } = updatePlayerDTO;

        const existingPlayer: Player | null = await this.getPlayerById({ id });

        if (!existingPlayer)
            throw new NotFoundException('Player does not exist!');

        const nameTaken: Player | null = await this.getPlayerByName(name);

        if (nameTaken)
            throw new ConflictException('Player name is already taken!');

        existingPlayer.name = name;

        return this.playersRepository.save(existingPlayer);
    }

    async deletePlayer(id: string): Promise<Player> {
        const existingPlayer: Player | null = await this.getPlayerById({ id });

        if (!existingPlayer)
            throw new NotFoundException('Player does not exist!');

        return this.playersRepository.remove(existingPlayer);
    }
}
