import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { GameLobbyMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { LobbyCommandKickGuest, LobbyCommandLeaveLobby, LobbyCommandStartGame } from '@user530/ws_game_shared/interfaces/ws-messages';
import { LobbyCommand, LobbyEvent, MessageType } from '@user530/ws_game_shared/types';
import { GameLobbyService } from '../../services/game_lobby/game_lobby.service';
import { Socket, Server } from 'socket.io';
import { LeaveLobbyDTO } from '../../dtos';

@WebSocketGateway({
  cors: '*',
  namespace: '/lobby',
})
export class GameLobbyGateway implements GameLobbyMessagesHandler, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly gameLobbyService: GameLobbyService
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('LOBBY GATEWAY - CONNECTION ESTABLISHED');
    console.log(client.handshake.auth);
    const { gameId, userId } = client.handshake.auth;
    // Update Lobby Status event to client, if guest joined also send Update Lobby Status to the host;
    const connectionEvent = await this.gameLobbyService.handleConnection({ gameId, userId });
    console.log('CONNECTION EVENT: ');
    console.log(connectionEvent)
    // If not restored -> Join lobby room
    if (!client.recovered) {
      console.log('Connecting user to the room');
      client.join(gameId);
    }

    // Host connected, no special interaction required
    if (connectionEvent === null) return;

    // Handle error+move event pair
    if (Array.isArray(connectionEvent)) {
      return connectionEvent.forEach(
        (event) => event.type === MessageType.ErrorMessage
          // Emit back error event
          ? client.emit(event.type, event)
          // Emit back move to hub event
          : client.emit(event.command, event)
      )
    }

    // Handle Guest connection -> broadcast to the room
    if (connectionEvent.command === LobbyEvent.GuestJoined) {
      console.log('Broadcast to the host Guest Joined event');
      return client.broadcast.to(gameId).emit(connectionEvent.command, connectionEvent)
    }

    if (connectionEvent.command === LobbyEvent.MovedToGame) {
      console.log('Emit to user Move To Game event');
      return client.emit(connectionEvent.command, connectionEvent);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('LOBBY GATEWAY - CONNECTION CLOSED');
    return
  }

  @SubscribeMessage(LobbyCommand.LeaveLobby)
  async wsLobbyLeaveLobbyListener(@ConnectedSocket() client: Socket, @MessageBody() leaveLobbyMessage: LeaveLobbyDTO): Promise<void> {
    console.log('LOBBY GATEWAY - LEAVE LOBBY MESSAGE RECIEVED');
    console.log(leaveLobbyMessage)
    const { gameId } = client.handshake.auth;
    const { data } = leaveLobbyMessage;
    const leaveEvents = await this.gameLobbyService.handleLeaveLobbyMessage(data);

    // Handle guest leave
    if (Array.isArray(leaveEvents)) {
      const guestEvent = leaveEvents[0];
      const hostEvent = leaveEvents[1];
      // Emit respective events
      client.emit(guestEvent.command, guestEvent);
      client.broadcast.to(gameId).emit(hostEvent.command, hostEvent);
      // PLACEHOLDER FOR THE HUB UPDATE EVENT!
    }
    // Handle host leave
    else if (leaveEvents.type === MessageType.LobbyEvent) {
      // Emit leave event to both
      this.server.to(gameId).emit(leaveEvents.command, leaveEvents);
    }
    else {
      client.emit(leaveEvents.type, leaveEvents)
    }
  }

  @SubscribeMessage(LobbyCommand.KickGuest)
  async wsLobbyKickGuestListener(@ConnectedSocket() client: Socket, @MessageBody() kickGuestMessage: LobbyCommandKickGuest): Promise<void> {
    console.log('LOBBY GATEWAY - KICK GUEST MESSAGE RECIEVED');
    // Check that player is host, If true -> Update the game (guest is null), Update lobby for the host, Emit to guest Move to Hub, Emit updated game list to Hub(!)
    const someEvents = await this.gameLobbyService.handleKickGuestMessage();
    return
  }

  @SubscribeMessage(LobbyCommand.StartGame)
  async wsLobbyStartGameListener(@ConnectedSocket() client: Socket, @MessageBody() startGameMessage: LobbyCommandStartGame): Promise<void> {
    console.log('LOBBY GATEWAY - START GAME MESSAGE RECIEVED');
    // Check that player is host, if true -> Update the game (status -> in progress), Emit Move to Game to the game room
    const someEvents = await this.gameLobbyService.handleStartGameMessage();
    return
  }
}
