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
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: MakeTurnDTO): Promise<void> {
    return this.gameInstanceService.handleMakeTurnMessage(this.server, client, payload);
  }
}
