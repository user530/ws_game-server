import { SubscribeMessage, ConnectedSocket, WebSocketGateway, OnGatewayConnection, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { GameHubMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners'
import { HubCommandHostGame, HubCommandJoinGame, HubCommandLeaveHub } from '@user530/ws_game_shared/interfaces/ws-messages';
import { HubCommand } from '@user530/ws_game_shared/types';
import { Server, Socket } from 'socket.io';
import { GameHubService } from '../../services/game_hub/game_hub.service';

@WebSocketGateway({
  cors: '*',
  namespace: '/hub'
})
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
  async wsHubHostGameListener(@ConnectedSocket() client: Socket, @MessageBody() hostGameMessage: HubCommandHostGame): Promise<void> {
    console.log('HOST GAME MESSAGE RECIEVED!');
    console.log(client.handshake.auth);
    console.log(hostGameMessage);

    const host = this.gameHubService.handleHostGameMessage();
    console.log(host);
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

    const leave = this.gameHubService.handleLeaveHubMessage();
    console.log(leave);
  }
}
