import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameTurnDTO, RequestGameTurnDTO } from 'src/database/dtos/game-turn';
import { GameTurn } from 'src/database/entities';
import { Repository } from 'typeorm';

interface IGameTurnControls {
    getGameTurns(requestGameTurnDTO: RequestGameTurnDTO): Promise<GameTurn[]>,
    addGameTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<GameTurn>,
}

@Injectable()
export class GameTurnService implements IGameTurnControls {
    constructor(
        @InjectRepository(GameTurn)
        private readonly gameturnRepository: Repository<GameTurn>
    ) { }

    async getGameTurns(requestGameTurnDTO: RequestGameTurnDTO): Promise<GameTurn[]> {
        console.log('GameTurnService - GetGameTurns');

        return this.gameturnRepository.find({
            where:
            {
                id: requestGameTurnDTO.game_id,
            }
        });
    }

    async addGameTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<GameTurn> {
        console.log('GameTurnService - AddGameTurn');
        console.log('CREATE GAME TURN DTO');
        console.log(createGameTurnDTO);
        const newTurn: GameTurn = await this.gameturnRepository.create({ game: createGameTurnDTO.game_id, });

        return await this.gameturnRepository.save(newTurn);
    }
}
