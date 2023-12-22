import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, ServerOptions } from 'socket.io';
import { GameInstanceService } from '../services/game_instance/game_instance.service';
import { MakeTurnDTO, ForfeitMatchDTO } from '../dtos';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { GameInstanceMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { GameCommand } from '@user530/ws_game_shared/types';

@WebSocketGateway({
  cors: '*',
  namespace: '/game'
})
@UsePipes(new ValidationPipe())
export class GameInstanceGateway implements OnGatewayConnection, OnGatewayDisconnect, GameInstanceMessagesHandler {
  @WebSocketServer()
  private server: Socket;

  constructor(
    private readonly gameInstanceService: GameInstanceService
  ) { }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    console.log('User connected!');
    // Read header - Auth token
    // Retrieve user from the token
    // Validate eglible user
    // Return game turns (GameTurnDataType[])

    if (!client.recovered) {
      console.log('Initial connection...Joining room');
      client.join('test');
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`User ${client.id} disconnected!`);
    console.log('Left rooms:')
    console.log(client.rooms);
  }

  @SubscribeMessage(GameCommand.MakeTurn)
  async wsGameMakeTurnListener(@ConnectedSocket() client: Socket, @MessageBody() payload: MakeTurnDTO): Promise<void> {
    console.log('GameInstanceGateway - MakeTurn message handler');
    const turnResultEvents = await this.gameInstanceService.handleMakeTurnMessage(payload);
    console.log('Turn result events', turnResultEvents);

    if (Array.isArray(turnResultEvents)) {
      console.log('Turn result is a pair. Emit to all players');

      turnResultEvents.forEach(event => this.server.emit(event.command, event));
    }
    else if (turnResultEvents.type === 'game_event') {
      console.log('Turn result is a single non-error event. Emit to all players');

      this.server.emit(turnResultEvents.command, turnResultEvents);
    }
    else {
      console.log('Turn result is an error event -> Emmit back to the sender');

      client.emit(turnResultEvents.type, turnResultEvents);
    }
  }

  @SubscribeMessage(GameCommand.ForfeitMatch)
  wsGameForfeitListener(@ConnectedSocket() client: Socket, @MessageBody() payload: ForfeitMatchDTO): Promise<void> {
    console.log('FORFEIT MESSAGE RECIEVED!');
    console.log(payload);
    return
  }
}
