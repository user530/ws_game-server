import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDTO, RequestGameDTO, RequestJoinGameDTO, RequestPlayerGamesDTO, UpdateGameStatusDTO } from 'src/database/dtos/game';
import { Game } from 'src/database/entities';
import { Repository } from 'typeorm';

interface IGameControls {
    getGameById(requestGameDTO: RequestGameDTO): Promise<Game>;
    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]>;
    getHostedGames(): Promise<Game[]>;
    hostGame(createGameDTO: CreateGameDTO): Promise<Game>;
    joinGame(requestJoinGameDTO: RequestJoinGameDTO): Promise<Game>;
    updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game>;
    clearEmptyGame(requestGameDTO: RequestGameDTO): Promise<Game>;
}

@Injectable()
export class GameService implements IGameControls {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>
    ) { }

    getGameById(requestGameDTO: RequestGameDTO): Promise<Game> {
        return
    }

    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]> {
        return;
    }

    getHostedGames(): Promise<Game[]> {
        return;
    }

    hostGame(createGameDTO: CreateGameDTO): Promise<Game> {
        return;
    }

    joinGame(requestJoinGameDTO: RequestJoinGameDTO): Promise<Game> {
        return;
    }

    updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game> {
        return;
    }

    clearEmptyGame(requestGameDTO: RequestGameDTO): Promise<Game> {
        return;
    }
}
