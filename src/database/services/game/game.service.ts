import { ConflictException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDTO, RequestGameDTO, RequestJoinGameDTO, RequestPlayerGamesDTO, SetWinnerDTO, UpdateGameStatusDTO } from 'src/database/dtos/game';
import { Game, Player } from 'src/database/entities';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { In, IsNull, Repository } from 'typeorm';

interface IGameControls {
    getGameById(requestGameDTO: RequestGameDTO): Promise<Game>;
    getAllPlayerGames(requestPlayerGames: RequestPlayerGamesDTO): Promise<Game[]>;
    getHostedGames(): Promise<Game[]>;
    hostGame(createGameDTO: CreateGameDTO): Promise<Game>;
    joinGame(requestJoinGameDTO: RequestJoinGameDTO): Promise<Game>;
    kickGuest(requestGameDTO: RequestGameDTO): Promise<Game>;
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
                where: [
                    {
                        host: {
                            id: requestPlayerGames.playerId,
                        }
                    },
                    {
                        guest: {
                            id: requestPlayerGames.playerId,
                        }
                    }
                ],
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
                    guest: IsNull(),
                    status: GameStatus.Pending,
                },
                order:
                {
                    createdAt: 'ASC',
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

        const updatedGame = await this.gameRepository
            .manager
            .transaction(
                async (transactionalEntityManager): Promise<Game> => {
                    const gameToJoin: Game = await transactionalEntityManager
                        .getRepository(Game)
                        .findOne(
                            {
                                where:
                                {
                                    id: gameId
                                }
                            });

                    if (!gameToJoin)
                        throw new NotFoundException('Game is not found!');

                    if (gameToJoin.host.id === guestId)
                        throw new ConflictException('Host and guest must be different entities!');

                    if (gameToJoin.status !== GameStatus.Pending || gameToJoin.guest !== null)
                        throw new NotAcceptableException('Game is not vacant!');

                    gameToJoin.guest = guest;

                    const updatedGame = await transactionalEntityManager.save(gameToJoin);

                    return updatedGame;
                }
            )

        return updatedGame;
    }

    async kickGuest(requestGameDTO: RequestGameDTO): Promise<Game> {
        const { gameId } = requestGameDTO;
        console.log('GAME SERVICE - KICK GUEST'); console.log('Game Id - ', gameId);
        const vacatedGame = await this.gameRepository
            .manager
            .transaction(
                async (transactionalEntityManager): Promise<Game> => {
                    const gameToClear = await transactionalEntityManager
                        .getRepository(Game)
                        .findOne({
                            where: {
                                id: gameId
                            }
                        });
                    console.log('GameToClear - '); console.log(gameToClear);
                    if (!gameToClear)
                        throw new NotFoundException('Game is not found!');
                    console.log('Game exists!');
                    if (!gameToClear.guest)
                        throw new NotAcceptableException('There is no guest to kick!');
                    console.log('Game has guest!');
                    if (gameToClear.status !== GameStatus.Pending)
                        throw new NotAcceptableException('Game is already past lobby state!');
                    console.log('Game has acceptable status!');
                    gameToClear.guest = null;

                    const updatedGame = await transactionalEntityManager.save(gameToClear);
                    console.log('Leaving transaction');
                    return updatedGame;
                }
            )
        console.log('Vacated game:'); console.log(vacatedGame);
        return vacatedGame;
    }

    async updateGameStatus(updateGameStatusDTO: UpdateGameStatusDTO): Promise<Game> {
        const { gameId, newStatus } = updateGameStatusDTO;
        console.log('GAME SERVICE - UPDATE GAME STATUS'); console.log(`GameId: ${gameId}, new status: ${newStatus}`);
        const updatedGame = await this.gameRepository
            .manager
            .transaction(
                async (transactionalEntityManager): Promise<Game> => {
                    const gameToUpdate = await transactionalEntityManager
                        .getRepository(Game)
                        .findOne(
                            {
                                where:
                                {
                                    id: gameId
                                },
                                relations: ['turns']
                            });
                    console.log('GameToUpdate- '); console.log(gameToUpdate);
                    if (!gameToUpdate)
                        throw new NotFoundException('Game not found!');
                    console.log('Game found.');
                    gameToUpdate.status = newStatus;
                    console.log('Leaving transaction');
                    return await transactionalEntityManager.save(gameToUpdate);
                }
            )
        console.log(updatedGame);
        return updatedGame;
    }

    async setWinner(setWinnerDTO: SetWinnerDTO): Promise<Game> {
        const { gameId, playerId } = setWinnerDTO;
        console.log('GAME SERVICE - SET WINNER'); console.log(`GameId: ${gameId}, playerId: ${playerId}`);
        const wonGame = await this.gameRepository
            .manager
            .transaction(
                async (transactionalEntityManager): Promise<Game> => {
                    const gameToWin = await transactionalEntityManager
                        .getRepository(Game)
                        .findOneBy(
                            { id: gameId }
                        );
                    console.log('Game to win - '); console.log(gameToWin);
                    if (!gameToWin)
                        throw new NotFoundException('Game is not found!');
                    console.log('Game found');
                    if (gameToWin.status !== GameStatus.InProgress)
                        throw new NotAcceptableException('Game is not active!');
                    console.log('Game is active');
                    const winner = await transactionalEntityManager
                        .getRepository(Player)
                        .findOneBy({ id: playerId })
                    console.log('Winner - '); console.log(winner);
                    if (!winner)
                        throw new NotFoundException('Player not found!');
                    console.log('Player found');
                    if (gameToWin.host.id !== playerId && gameToWin.guest.id !== playerId)
                        throw new UnauthorizedException('Unauthorized user!');
                    console.log('Winner is applicable for the game');
                    gameToWin.winner = winner;
                    console.log('Leaving transaction');
                    return await transactionalEntityManager.save(gameToWin);
                }
            )
        console.log('Won game:'); console.log(wonGame);
        return wonGame;
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
