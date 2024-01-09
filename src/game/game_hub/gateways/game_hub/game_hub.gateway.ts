import { SubscribeMessage, ConnectedSocket, WebSocketGateway, OnGatewayConnection, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { GameHubMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { HubCommandHostGame, HubCommandJoinGame, HubCommandLeaveHub } from '@user530/ws_game_shared/interfaces/ws-messages';
import { HubCommand } from '@user530/ws_game_shared/types';
import { Server, Socket } from 'socket.io';
import { GameHubService } from '../../services/game_hub/game_hub.service';
import { HostGameDTO } from '../../dtos';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: '*',
  namespace: '/hub'
})
@UsePipes(new ValidationPipe())
export class GameHubGateway implements OnGatewayConnection, GameHubMessagesHandler {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly gameHubService: GameHubService
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const gamesUpdatedEvent = await this.gameHubService.handleConnection();
    client.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);
  }

  @SubscribeMessage(HubCommand.HostGame)
  async wsHubHostGameListener(@ConnectedSocket() client: Socket, @MessageBody() hostGameMessage: HostGameDTO): Promise<void> {
    console.log('HOST GAME MESSAGE RECIEVED!');
    console.log(client.handshake.auth);
    console.log(hostGameMessage);

    const hostGameEvents = await this.gameHubService.handleHostGameMessage(hostGameMessage);

    // Send lobby data to the host and new game list to the others
    if (Array.isArray(hostGameEvents)) {
      const [movedToLobbyEvent, gamesUpdatedEvent] = hostGameEvents;
      // To host
      client.emit(movedToLobbyEvent.command, movedToLobbyEvent);
      // To others
      client.broadcast.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);
    }
    // Error -> Emit to sender
    else {
      client.emit(hostGameEvents.type, hostGameEvents);
    }
  }

  @SubscribeMessage(HubCommand.JoinGame)
  async wsHubJoinGameListener(@ConnectedSocket() client: Socket, @MessageBody() joinGameMessage: HubCommandJoinGame): Promise<void> {
    console.log('JOIN GAME MESSAGE RECIEVED!');
    console.log(client.handshake.auth);
    console.log(joinGameMessage);

    const join = this.gameHubService.handleJoinGameMessage();
    console.log(join);
  }

  @SubscribeMessage(HubCommand.LeaveHub)
  async wsHubLeaveHubListener(@ConnectedSocket() client: Socket, @MessageBody() leaveHubMessage: HubCommandLeaveHub): Promise<void> {
    console.log('LEAVE HUB MESSAGE RECIEVED!');
    console.log(client.handshake.auth);
    console.log(leaveHubMessage);

    const leftHubEvent = await this.gameHubService.handleLeaveHubMessage();
    client.emit(leftHubEvent.command);
  }
}
