import { Injectable, NotFoundException } from '@nestjs/common';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus, GameFieldSquare, GameTurnResult } from '@user530/ws_game_shared/enums';
import { GameCommandDataType } from '@user530/ws_game_shared/interfaces/ws-messages';
import { GameTurnDataType } from '@user530/ws_game_shared/interfaces/ws-events';
import { getGridSquare } from '@user530/ws_game_shared/helpers';
import { CreateGameTurnDTO } from 'src/database/dtos/game-turn';
import { Game, GameTurn, Player } from 'src/database/entities';
import { RequestGameDTO, SetWinnerDTO } from 'src/database/dtos/game';

interface IGameInstanceService {
    registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void>;
    processTurn(turnData: GameCommandDataType): Promise<Game>;
    lastTurnResult({ gameStatus, gameWinner }: { gameStatus: GameStatus, gameWinner: Player }): GameTurnResult;
    lastTurnMark({ gameHost, lastTurn }: { gameHost: Player, lastTurn: GameTurn }): GameTurnDataType['mark'];
    processForfeit(forfeitData: Pick<GameCommandDataType, 'game_id' | 'player_id'>): Promise<Game>;
    getGameTurns(gameId: string): Promise<GameTurnDataType[]>;
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

    lastTurnMark({ gameHost, lastTurn }: { gameHost: Player; lastTurn: GameTurn; }): GameTurnDataType['mark'] {
        return lastTurn.player.id === gameHost.id ? 'X' : 'O';
    }

    async registerTurn(createGameTurnDTO: CreateGameTurnDTO): Promise<void> {
        console.log('Register turn fired!');
        await this.gameTurnService.addGameTurn(createGameTurnDTO);
    }

    async processTurn(turnData: GameCommandDataType): Promise<Game> {
        console.log('Process turn - Checking win condition');
        const { game_id, player_id } = turnData;

        const game = await this.gameService.getGameById({ game_id });

        if (!game)
            throw new NotFoundException('Game is not found!');
        console.log('Process turn - game found');
        const { turns } = game;

        const isWin = await this.checkWinCondition(turns);
        console.log('Win condition checked!');
        if (isWin) {
            console.log('GAME IS WON!');
            const newGameState = await this.handleWin({ game_id, player_id });
            return newGameState;
        }
        console.log('Game still not won!');
        const isDraw = await this.checkDrawCondition(turns);

        if (isDraw) {
            console.log('GAME IS DRAW!');
            const newGameState = await this.handleDraw({ game_id });
            return newGameState;
        }
        console.log('Game still not draw!');
        return game;
    }

    private async checkWinCondition(turns: GameTurn[]): Promise<boolean> {
        console.log('Check win condition - fired!')

        const { player: { id: player_id }, row, column } = turns.slice(-1)[0];

        // Check the row
        const horizontal = turns.filter((turn) => turn.row === row && turn.player?.id === player_id);
        console.log('Horizontal ', horizontal)
        if (horizontal.length === 3)
            return true;

        // Check the column
        const vertical = turns.filter((turn) => turn.column === column && turn.player?.id === player_id);
        console.log('Vertical ', vertical)
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

        console.log('Game not won!');

        // Game going on
        return false;
    }

    private async checkDrawCondition(turns: GameTurn[]): Promise<boolean> {
        console.log('CHECK DRAW - FIRED!');
        console.log(turns)
        if (turns && turns.length === 9)
            return true;

        return false;
    }

    private async handleWin(setWinnerDTO: SetWinnerDTO): Promise<Game> {
        console.log('Game logic service - Handle win fired!');

        await this.gameService.setWinner(setWinnerDTO);
        const newGameState = await this.gameService.updateGameStatus({ game_id: setWinnerDTO.game_id, new_status: GameStatus.Completed });

        return newGameState;
    }

    private async handleDraw(requestGameDTO: RequestGameDTO): Promise<Game> {
        console.log('Game logic service - Handle draw fired!');

        const newGameState = await this.gameService.updateGameStatus({ game_id: requestGameDTO.game_id, new_status: GameStatus.Completed });

        return newGameState;
    }

    async processForfeit(forfeitData: Pick<GameCommandDataType, 'game_id' | 'player_id'>): Promise<Game> {
        const { game_id, player_id } = forfeitData;
        console.log(`Process forfeit: gameId - ${game_id}, playerId - ${player_id}`);
        const game = await this.gameService.getGameById({ game_id });

        if (!game)
            throw new NotFoundException('Game is not found!');
        console.log('Process forfeit - game found');

        const winnerId = game.host.id === player_id ? game.guest.id : game.host.id;
        console.log('Process forfeit - winner id: ', winnerId);
        const newGameState = await this.handleWin({ game_id, player_id: winnerId });
        console.log('Process forfeit - new game state');
        console.log(newGameState);
        return newGameState;
    }

    async getGameTurns(gameId: string): Promise<GameTurnDataType[]> {
        console.log('Process turn - Get game turns');

        const game = await this.gameService.getGameById({ game_id: gameId });

        if (!game)
            throw new NotFoundException('Game is not found!');

        const gameTurnsData: GameTurnDataType[] = game.turns.map(
            ({ row, column, player: { id: playerId } }) => ({
                column, row, mark: playerId === game.host.id ? 'X' : 'O'
            })
        )

        return gameTurnsData;
    }
}
