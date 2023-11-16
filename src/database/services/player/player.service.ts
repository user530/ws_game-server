import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlayerDTO, RequestPlayerByIdDTO, RequestPlayerByNameDTO, UpdatePlayerDTO, DeletePlayerDTO } from 'src/database/dtos/players';
import { Player } from 'src/database/entities/';
import { Repository } from 'typeorm';

interface IPlayerControls {
    getAllPlayers(): Promise<Player[]>,
    getPlayerById(requestPlayerByIdDTO: RequestPlayerByIdDTO): Promise<Player | null>,
    getPlayerByName(requestPlayerByNameDTO: RequestPlayerByNameDTO): Promise<Player | null>,
    createPlayer(createPlayerDTO: CreatePlayerDTO): Promise<Player>,
    updatePlayer(updatePlayerDTO: UpdatePlayerDTO): Promise<Player>,
    deletePlayer(deletePlayerDTO: DeletePlayerDTO): Promise<Player>,
}

@Injectable()
export class PlayerService implements IPlayerControls {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>
    ) { }

    async getAllPlayers(): Promise<Player[]> {
        return await this.playersRepository.find({ order: { id: 'ASC' } });
    }

    async getPlayerById(requestPlayerByIdDTO: RequestPlayerByIdDTO): Promise<Player | null> {
        return this.playersRepository.findOne(
            {
                where:
                {
                    id: requestPlayerByIdDTO.id
                }
            }
        );
    }

    async getPlayerByName(requestPlayerByNameDTO: RequestPlayerByNameDTO): Promise<Player | null> {
        return this.playersRepository.findOne(
            {
                where:
                {
                    name: requestPlayerByNameDTO.name
                }
            }
        );
    }

    async createPlayer(createPlayerDTO: CreatePlayerDTO): Promise<Player> {
        const existingPlayer: Player | null = await this.getPlayerByName({ ...createPlayerDTO });

        if (existingPlayer)
            throw new ConflictException('Player name is already taken!');

        const newPlayer: Player = await this.playersRepository.create(createPlayerDTO);

        return this.playersRepository.save(newPlayer);
    }

    async updatePlayer(updatePlayerDTO: UpdatePlayerDTO): Promise<Player> {
        const { id, name } = updatePlayerDTO;
        const existingPlayer: Player | null = await this.getPlayerById({ id });

        if (!existingPlayer)
            throw new NotFoundException('Player does not exist!');

        const nameTaken: Player | null = await this.getPlayerByName({ name });

        if (nameTaken)
            throw new ConflictException('Player name is already taken!');

        existingPlayer.name = name;

        return this.playersRepository.save(existingPlayer);
    }

    async deletePlayer(deletePlayerDTO: DeletePlayerDTO): Promise<Player> {
        const existingPlayer: Player | null = await this.getPlayerById({ ...deletePlayerDTO });

        if (!existingPlayer)
            throw new NotFoundException('Player does not exist!');

        return this.playersRepository.remove(existingPlayer);
    }
}
