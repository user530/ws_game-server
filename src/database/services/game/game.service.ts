import { ConflictException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDTO, RequestGameDTO, RequestJoinGameDTO, RequestPlayerGamesDTO, SetWinnerDTO, UpdateGameStatusDTO } from 'src/database/dtos/game';
import { Game, Player } from 'src/database/entities';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { In, Repository } from 'typeorm';

interface IGameControls {
    getGameById(requestGameDTO: RequestGameDTO): Promise<Game>;
    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]>;
    getHostedGames(): Promise<Game[]>;
    hostGame(createGameDTO: CreateGameDTO): Promise<Game>;
    joinGame(requestJoinGameDTO: RequestJoinGameDTO): Promise<Game>;
    updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game>;
    clearEmptyGames(): Promise<void>;
}

@Injectable()
export class GameService implements IGameControls {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
    ) { }

    getGameById(requestGameDTO: RequestGameDTO): Promise<Game | null> {
        return this.gameRepository.findOne({ where: { id: requestGameDTO.game_id }, relations: ['turns'] });
    }

    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]> {
        return this.gameRepository.find(
            {
                where:
                {
                    host: {
                        id: requestPlayerGames.player_id
                    }
                },
                order:
                {
                    createdAt: 'ASC',
                },
                relations: ['turns']
            }
        );
    }

    getHostedGames(): Promise<Game[]> {
        return this.gameRepository.find(
            {
                where:
                {
                    status: GameStatus.Pending,
                },
                order:
                {
                    createdAt: 'DESC',
                },
                relations: ['turns']
            },
        );
    }

    async hostGame(createGameDTO: CreateGameDTO): Promise<Game> {

        const host: Player = await this.playerRepository.findOneBy({ id: createGameDTO.host_id })

        if (!host)
            throw new NotFoundException('Host not found!');

        const alreadyHosting: Game = await this.gameRepository.findOneBy(
            {
                host: { id: host.id },
                status: In([GameStatus.Pending, GameStatus.InProgress]),
            }
        );

        if (alreadyHosting)
            throw new ConflictException('User already in game!');

        const newGame: Game = await this.gameRepository.create({ host });

        return this.gameRepository.save(newGame);
    }

    async joinGame(requestJoinGameDTO: RequestJoinGameDTO): Promise<Game> {

        const host: Player = await this.playerRepository.findOneBy({ id: requestJoinGameDTO.host_id })

        if (!host)
            throw new NotFoundException('Host is not found!');

        const guest: Player = await this.playerRepository.findOneBy({ id: requestJoinGameDTO.guest_id });

        if (!guest)
            throw new NotFoundException('Guest is not found!');

        if (guest.id === host.id)
            throw new ConflictException('Host and guest must be unique entities!');

        const gameToJoin: Game = await this.gameRepository.findOneBy(
            {
                host: { id: host.id },
                status: GameStatus.Pending,
            });

        if (!gameToJoin)
            throw new NotFoundException('No pendings game from the user!');

        gameToJoin.guest = guest;
        gameToJoin.status = GameStatus.InProgress;

        return this.gameRepository.save(gameToJoin);
    }

    async updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game> {
        const { game_id, new_status } = updateGameStatusDTO;
        const gameToUpdate: Game = await this.gameRepository.findOne({ where: { id: game_id }, relations: ['turns'] });

        if (!gameToUpdate)
            throw new NotFoundException('Game not found!');

        gameToUpdate.status = new_status;

        return this.gameRepository.save(gameToUpdate);
    }

    async setWinner(setWinnerDTO: SetWinnerDTO): Promise<Game> {
        const { game_id, player_id } = setWinnerDTO;

        const game = await this.gameRepository.findOneBy({ id: game_id });

        if (!game)
            throw new NotFoundException('Game is not found!');

        if (game.status !== GameStatus.InProgress)
            throw new NotAcceptableException('Game is not active!');

        const winingPlayer = await this.playerRepository.findOneBy({ id: player_id })

        if (!winingPlayer)
            throw new NotFoundException('Player not found!');

        if (game.host.id !== player_id && game.guest.id !== player_id)
            throw new UnauthorizedException('Unauthorized user!');

        game.winner = winingPlayer;

        return this.gameRepository.save(game);
    }

    async clearEmptyGames(): Promise<void> {
        const games: Game[] = await this.gameRepository.find({});

        games.forEach(async (game: Game) => {
            if (!game.host && !game.guest)
                await this.gameRepository.remove(game);
        });

        return;
    }
}
