import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MakeTurnDTO, ForfeitMatchDTO } from '../dtos';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameService, GameTurnService } from 'src/database/services';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { ErrorMessage } from '@user530/ws_game_shared/interfaces';
import { createErrorMessage } from '@user530/ws_game_shared/creators';

interface IGameInstanceService {
    handleMakeTurnMessage(client: Socket, payload: MakeTurnDTO): Promise<void>;
    handleForfeitMessage(client: Socket, payload: ForfeitMatchDTO): Promise<void>;
}

@Injectable()
export class GameInstanceService implements IGameInstanceService {
    constructor(
        private readonly gameTurnService: GameTurnService,
        private readonly gameService: GameService,
    ) { }

    emitError(socketConnection: Socket, errorMessage: ErrorMessage) {
        socketConnection.emit('error', errorMessage);
    }

    async handleMakeTurnMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: MakeTurnDTO): Promise<void> {
        console.log('Handle MakeTurn fired!');
        console.log(`User ${client.id} made a turn`);
        console.log(payload);

        const { game_id, player_id } = payload.data;
        const game = await this.gameService.getGameById({ game_id });

        console.log(game);

        if (!game)
            return this.emitError(client, createErrorMessage({ code: 404, message: 'Game not found!' }));

        if (game.status !== GameStatus.InProgress)
            return this.emitError(client, createErrorMessage({ code: 406, message: 'Game is not active!' }));

        if (game.guest.id !== player_id || game.host.id !== player_id)
            return this.emitError(client, createErrorMessage({ code: 401, message: 'Unauthorized user!' }));

        // CHECK THAT IT IS PLAYERS TURN

        const turns = await this.gameTurnService.getGameTurns({ game_id });
        console.log(turns)


        return
    }

    handleForfeitMessage(
        client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
        payload: ForfeitMatchDTO): Promise<void> {
        return
    }
}
