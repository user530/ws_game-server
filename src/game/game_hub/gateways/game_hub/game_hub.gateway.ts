import { SubscribeMessage, ConnectedSocket, WebSocketGateway, OnGatewayConnection, MessageBody } from '@nestjs/websockets';
import { GameHubMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { HubCommand, MessageType } from '@user530/ws_game_shared/types';
import { Socket } from 'socket.io';
import { GameHubService } from '../../services/game_hub/game_hub.service';
import { HostGameDTO, JoinGameDTO } from '../../dtos';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: '*',
  namespace: '/hub'
})
@UsePipes(new ValidationPipe())
export class GameHubGateway implements OnGatewayConnection, GameHubMessagesHandler {
  constructor(
    private readonly gameHubService: GameHubService
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const { userId } = client.handshake.auth;
    console.log('HUB HANDLE CONNECTION. USER ID: ', userId)
    const gamesUpdatedEvent = await this.gameHubService.handleConnection({ userId });

    // Emit hub event to the user
    if (gamesUpdatedEvent.type === MessageType.HubEvent) {
      client.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);
    }
    // Error -> Emit to sender
    else {
      client.emit(gamesUpdatedEvent.type, gamesUpdatedEvent);
    }

  }

  @SubscribeMessage(HubCommand.HostGame)
  async wsHubHostGameListener(@ConnectedSocket() client: Socket, @MessageBody() hostGameMessage: HostGameDTO): Promise<void> {
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
  async wsHubJoinGameListener(@ConnectedSocket() client: Socket, @MessageBody() joinGameMessage: JoinGameDTO): Promise<void> {
    const joinGameEvents = await this.gameHubService.handleJoinGameMessage(joinGameMessage);

    // Send lobby data to the guest and new game list to the others
    if (Array.isArray(joinGameEvents)) {
      const [movedToLobbyEvent, gamesUpdatedEvent] = joinGameEvents;
      // To guest
      client.emit(movedToLobbyEvent.command, movedToLobbyEvent);
      // To others
      client.broadcast.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);
    }
    // Error -> Emit to sender
    else {
      client.emit(joinGameEvents.type, joinGameEvents);
    }
  }

  @SubscribeMessage(HubCommand.LeaveHub)
  async wsHubLeaveHubListener(@ConnectedSocket() client: Socket): Promise<void> {
    const leftHubEvent = await this.gameHubService.handleLeaveHubMessage();
    client.emit(leftHubEvent.command);
  }
}
