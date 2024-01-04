import { Injectable, NotFoundException } from '@nestjs/common';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus, GameFieldSquare, GameTurnResult } from '@user530/ws_game_shared/enums';
import { GameCommandTurnData, GameCommandForfeitData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { GameEventTurnData } from '@user530/ws_game_shared/interfaces/ws-events';
import { getGridSquare } from '@user530/ws_game_shared/helpers';
import { CreateGameTurnDTO } from 'src/database/dtos/game-turn';
import { Game, GameTurn, Player } from 'src/database/entities';
import { RequestGameDTO, SetWinnerDTO } from 'src/database/dtos/game';

interface IGameInstanceService {
    registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void>;
    processTurn(turnData: GameCommandTurnData): Promise<Game>;
    lastTurnResult({ gameStatus, gameWinner }: { gameStatus: GameStatus, gameWinner: Player }): GameTurnResult;
    lastTurnMark({ gameHost, lastTurn }: { gameHost: Player, lastTurn: GameTurn }): GameEventTurnData['mark'];
    processForfeit(forfeitData: GameCommandForfeitData): Promise<Game>;
    getGameTurns(gameId: string): Promise<GameEventTurnData[]>;
}


@Injectable()
export class GameLogicService implements IGameInstanceService {
    constructor(
        private readonly gameService: GameService,
        private readonly gameTurnService: GameTurnService,
    ) { }

    lastTurnResult({ gameStatus, gameWinner }: { gameStatus: GameStatus; gameWinner: Player; }): GameTurnResult {
        return gameStatus === GameStatus.Completed
            ? gameWinner
                ? GameTurnResult.Win
                : GameTurnResult.Draw
            : GameTurnResult.Not_Decided
    }

    lastTurnMark({ gameHost, lastTurn }: { gameHost: Player; lastTurn: GameTurn; }): GameEventTurnData['mark'] {
        return lastTurn.player.id === gameHost.id ? 'X' : 'O';
    }

    async registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void> {
        await this.gameTurnService.addGameTurn(createGameTurnDTO);
    }

    async processTurn(turnData: GameCommandTurnData): Promise<Game> {
        const { gameId, playerId } = turnData;

        const game = await this.gameService.getGameById({ gameId });

        if (!game)
            throw new NotFoundException('Game is not found!');

        const { turns } = game;

        const isWin = await this.checkWinCondition(turns);

        if (isWin) {
            const newGameState = await this.handleWin({ gameId, playerId });

            return newGameState;
        }

        const isDraw = await this.checkDrawCondition(turns);

        if (isDraw) {
            const newGameState = await this.handleDraw({ gameId });

            return newGameState;
        }

        return game;
    }

    private async checkWinCondition(turns: GameTurn[]): Promise<boolean> {
        const { player: { id: player_id }, row, column } = turns.slice(-1)[0];

        // Check the row
        const horizontal = turns.filter((turn) => turn.row === row && turn.player?.id === player_id);

        if (horizontal.length === 3)
            return true;

        // Check the column
        const vertical = turns.filter((turn) => turn.column === column && turn.player?.id === player_id);

        if (vertical.length === 3)
            return true;

        // Check diagonals
        const diagonal1 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_1, GameFieldSquare.Square_5, GameFieldSquare.Square_9]
                    .includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);

        const diagonal2 = turns.filter(
            (turn) =>
                [GameFieldSquare.Square_3, GameFieldSquare.Square_5, GameFieldSquare.Square_7]
                    .includes(getGridSquare(turn.row, turn.column)) && turn.player?.id === player_id);

        if (diagonal1.length === 3 || diagonal2.length === 3)
            return true;

        // Game going on
        return false;
    }

    private async checkDrawCondition(turns: GameTurn[]): Promise<boolean> {
        if (turns && turns.length === 9)
            return true;

        return false;
    }

    private async handleWin(setWinnerDTO: SetWinnerDTO): Promise<Game> {
        await this.gameService.setWinner(setWinnerDTO);

        const newGameState = await this.gameService.updateGameStatus({ gameId: setWinnerDTO.gameId, newStatus: GameStatus.Completed });

        return newGameState;
    }

    private async handleDraw(requestGameDTO: RequestGameDTO): Promise<Game> {
        const newGameState = await this.gameService.updateGameStatus({ gameId: requestGameDTO.gameId, newStatus: GameStatus.Completed });

        return newGameState;
    }

    async processForfeit(forfeitData: GameCommandForfeitData): Promise<Game> {
        const { gameId, playerId } = forfeitData;

        const game = await this.gameService.getGameById({ gameId });

        if (!game)
            throw new NotFoundException('Game is not found!');

        const winnerId = game.host.id === playerId ? game.guest.id : game.host.id;

        const newGameState = await this.handleWin({ gameId, playerId: winnerId });

        return newGameState;
    }

    async getGameTurns(gameId: string): Promise<GameEventTurnData[]> {
        const game = await this.gameService.getGameById({ gameId });

        if (!game)
            throw new NotFoundException('Game is not found!');

        const gameTurnsData: GameEventTurnData[] = game.turns.map(
            ({ row, column, player: { id: playerId } }) => ({
                column, row, mark: playerId === game.host.id ? 'X' : 'O'
            })
        )

        return gameTurnsData;
    }
}
