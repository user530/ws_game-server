import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
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

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    const { gameId } = client.handshake.auth;

    const turnEvents = await this.gameInstanceService.handleConnection(gameId);

    if (!client.recovered) {
      console.log('Initial connection...Joining room');
      client.join('test');
    }

    // Return to client all game turns
    if (Array.isArray(turnEvents))
      turnEvents.forEach((turnEvent) => client.emit(turnEvent.command, turnEvent));

    // Error event
    else
      client.emit(turnEvents.type, turnEvents);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`User ${client.id} disconnected!`);
    console.log('Left rooms:')
    console.log(client.rooms);
  }

  @SubscribeMessage(GameCommand.MakeTurn)
  async wsGameMakeTurnListener(@ConnectedSocket() client: Socket, @MessageBody() payload: MakeTurnDTO): Promise<void> {
    const turnResultEvents = await this.gameInstanceService.handleMakeTurnMessage(payload);

    // Turn that ended the game
    if (Array.isArray(turnResultEvents))
      turnResultEvents.forEach(event => this.server.emit(event.command, event));

    // Regular turn
    else if (turnResultEvents.type === 'game_event')
      this.server.emit(turnResultEvents.command, turnResultEvents);

    // Error -> Emit to sender
    else
      client.emit(turnResultEvents.type, turnResultEvents);
  }

  @SubscribeMessage(GameCommand.ForfeitMatch)
  async wsGameForfeitListener(@ConnectedSocket() client: Socket, @MessageBody() payload: ForfeitMatchDTO): Promise<void> {
    const forfeitEvent = await this.gameInstanceService.handleForfeitMessage(payload);

    // Forfeit event
    if (forfeitEvent.type === 'game_event')
      this.server.emit(forfeitEvent.command, forfeitEvent);

    // Error -> Emit to sender
    else
      client.emit(forfeitEvent.type, forfeitEvent);
  }
}
