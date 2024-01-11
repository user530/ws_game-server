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
        return this.gameRepository.findOne({ where: { id: requestGameDTO.gameId }, relations: ['turns'] });
    }

    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]> {
        return this.gameRepository.find(
            {
                where:
                {
                    host: {
                        id: requestPlayerGames.playerId
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

        const host: Player = await this.playerRepository.findOneBy({ id: createGameDTO.hostId })

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
        const { gameId, guestId } = requestJoinGameDTO;
        const guest: Player = await this.playerRepository.findOneBy({ id: guestId });

        if (!guest)
            throw new NotFoundException('Guest is not found!');

        const updatedGame = await this.gameRepository.manager.transaction(
            async (transactionalEntityManager): Promise<Game> => {
                const gameToJoin: Game = await transactionalEntityManager.getRepository(Game).findOne({ where: { id: gameId } });

                if (!gameToJoin)
                    throw new NotFoundException('Game is not found!');

                if (gameToJoin.host.id === guestId)
                    throw new ConflictException('Host and guest must be different entities!');

                if (gameToJoin.status !== GameStatus.Pending || gameToJoin.guest !== null)
                    throw new NotAcceptableException('Game is not vacant!');

                gameToJoin.guest = guest;
                gameToJoin.status = GameStatus.InProgress;

                const updatedGame = await transactionalEntityManager.save(gameToJoin);

                return updatedGame;
            }
        )

        return updatedGame;
    }

    async updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game> {
        const { gameId, newStatus } = updateGameStatusDTO;
        const gameToUpdate: Game = await this.gameRepository.findOne({ where: { id: gameId }, relations: ['turns'] });

        if (!gameToUpdate)
            throw new NotFoundException('Game not found!');

        gameToUpdate.status = newStatus;

        return this.gameRepository.save(gameToUpdate);
    }

    async setWinner(setWinnerDTO: SetWinnerDTO): Promise<Game> {
        const { gameId, playerId } = setWinnerDTO;

        const game = await this.gameRepository.findOneBy({ id: gameId });

        if (!game)
            throw new NotFoundException('Game is not found!');

        if (game.status !== GameStatus.InProgress)
            throw new NotAcceptableException('Game is not active!');

        const winningPlayer = await this.playerRepository.findOneBy({ id: playerId })

        if (!winningPlayer)
            throw new NotFoundException('Player not found!');

        if (game.host.id !== playerId && game.guest.id !== playerId)
            throw new UnauthorizedException('Unauthorized user!');

        game.winner = winningPlayer;

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
