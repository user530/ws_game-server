import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameInstanceService } from '../services/game_instance.service'

@WebSocketGateway(
  {
    cors: '*',
  }
)
export class GameInstanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Socket;

  constructor(
    private readonly gameInstanceService: GameInstanceService
  ) { }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`User ${client.id} connected!`);
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.id} disconnected!`);
  }

  @SubscribeMessage('made_turn')
  handleMessage(client: Socket, @MessageBody() payload: any): string {
    console.log(`User ${client.id} made a turn!`);

    return;
  }
}
