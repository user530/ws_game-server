import { ConflictException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { CreateGameTurnDTO, RequestGameTurnDTO } from 'src/database/dtos/game-turn';
import { Game, GameTurn, Player } from 'src/database/entities';
import { Repository } from 'typeorm';

interface IGameTurnControls {
    getGameTurns(requestGameTurnDTO: RequestGameTurnDTO): Promise<GameTurn[]>,
    addGameTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<GameTurn>,
}

@Injectable()
export class GameTurnService implements IGameTurnControls {
    constructor(
        @InjectRepository(Player)
        private readonly playerRepository: Repository<Player>,
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(GameTurn)
        private readonly gameturnRepository: Repository<GameTurn>,
    ) { }

    async getGameTurns(requestGameTurnDTO: RequestGameTurnDTO): Promise<GameTurn[]> {
        return this.gameturnRepository.find({
            where:
            {
                id: requestGameTurnDTO.gameId,
            }
        });
    }

    async addGameTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<GameTurn> {
        const { gameId, playerId, row, column } = createGameTurnDTO;

        const game = await this.gameRepository.findOne({ where: { id: gameId }, relations: ['turns'] });

        // Check that game exists
        if (!game)
            throw new NotFoundException('Game not found!');

        // Check that game has both players (started)
        if (!game.guest)
            throw new NotAcceptableException('Game is not active!');

        const { status, guest, host, turns } = game;

        // Check that game is active (ready to recieve turns)
        if (status !== GameStatus.InProgress)
            throw new NotAcceptableException('Game is not active!');

        const player = await this.playerRepository.findOneBy({ id: playerId });

        // Check valid player
        if (!player)
            throw new NotFoundException('Player not found!');

        // Check that turn is made by one of the players of the game
        if (player.id !== host.id && player.id !== guest.id)
            throw new UnauthorizedException('Unauthorized user!');

        // Check correct turn order
        const prevTurnPlayer = turns?.at(-1)?.player ?? guest;

        // Id of the player who made the last move / if first turn we set guest_id as the last player
        if (player.id === prevTurnPlayer.id)
            throw new UnauthorizedException('Wait for your turn!');

        // Check vacant position
        if (turns && turns.find((turn) => turn.column === column && turn.row === row))
            throw new ConflictException('The game field is already taken!');

        const newTurn: GameTurn = await this.gameturnRepository.create({ game, player, row, column });

        return await this.gameturnRepository.save(newTurn);
    }
}
