import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameInstanceService } from '../services/game_instance.service';
import { MadeTurnDTO } from '../dtos/made-turn.dto';
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

  @SubscribeMessage('made_turn')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: MadeTurnDTO): string {
    console.log(`User ${client.id} made a turn!`);
    console.log(payload)

    return;
  }
}
