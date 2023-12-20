import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameInstanceService } from '../services/game_instance/game_instance.service';
import { MakeTurnDTO } from '../dtos/make-turn.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway(
  {
    cors: '*',
  }
)
@UsePipes(new ValidationPipe())
export class GameInstanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Socket;

  constructor(
    private readonly gameInstanceService: GameInstanceService
  ) { }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    console.log(`User ${client.id} connected!`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`User ${client.id} disconnected!`);
  }

  @SubscribeMessage('make_turn')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: MakeTurnDTO): Promise<void> {
    console.log('GameInstanceGateway - MakeTurn message handler');
    const turnResultEvents = await this.gameInstanceService.handleMakeTurnMessage(payload);
    console.log('Turn result events', turnResultEvents);

    if (Array.isArray(turnResultEvents)) {
      console.log('Turn result is a pair. Emit to all players');
      turnResultEvents.forEach(
        event => 'data' in event
          ? this.server.emit(event.command, event.data)
          : this.server.emit(event.command)
      );
    }
    else if (turnResultEvents.type === 'game_event') {
      console.log('Turn result is a single non-error event. Emit to all players');
      this.server.emit(turnResultEvents.command, turnResultEvents.data);
    }
    else {
      console.log('Turn result is an error event -> Emmit back to the sender');
      client.emit(turnResultEvents.type, { code: turnResultEvents.code, message: turnResultEvents.message });
    }
  }
}
