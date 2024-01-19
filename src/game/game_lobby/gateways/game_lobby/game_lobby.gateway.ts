import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { GameLobbyMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { LobbyCommandKickGuest, LobbyCommandLeaveLobby, LobbyCommandStartGame } from '@user530/ws_game_shared/interfaces/ws-messages';
import { LobbyCommand, MessageType } from '@user530/ws_game_shared/types';
import { GameLobbyService } from '../../services/game_lobby/game_lobby.service';
import { Socket, Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';

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

  async handleConnection(client: Socket) {
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

    // No event needed
    if (connectionEvent === null) return;

    // Inform host about the updated game
    if (connectionEvent.type === MessageType.LobbyEvent) {
      console.log('Broadcast to the host Guest Joined event');
      client.broadcast.to(gameId).emit(connectionEvent.command, connectionEvent)
    }
    // Emit Error and disconnect user 
    else {
      console.log('Error event emit')
      client.emit(connectionEvent.type, connectionEvent);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('LOBBY GATEWAY - CONNECTION CLOSED');
    return
  }

  @SubscribeMessage(LobbyCommand.LeaveLobby)
  async wsLobbyLeaveLobbyListener(socket: Socket, leaveLobbyMessage: LobbyCommandLeaveLobby): Promise<void> {
    console.log('LOBBY GATEWAY - LEAVE LOBBY MESSAGE RECIEVED');
    console.log(socket.data)
    // If user is host -> Abort the game, emit to both: Move to Hub event
    // If user is guest -> Update the game (guest is null), Update New Lobby Status to host, Emit to guest Move to Hub, Emit updated game list to Hub(!) 
    const someEvents = await this.gameLobbyService.handleLeaveLobbyMessage();
    return
  }

  @SubscribeMessage(LobbyCommand.KickGuest)
  async wsLobbyKickGuestListener(socket: Socket, kickGuestMessage: LobbyCommandKickGuest): Promise<void> {
    console.log('LOBBY GATEWAY - KICK GUEST MESSAGE RECIEVED');
    // Check that player is host, If true -> Update the game (guest is null), Update lobby for the host, Emit to guest Move to Hub, Emit updated game list to Hub(!)
    const someEvents = await this.gameLobbyService.handleKickGuestMessage();
    return
  }

  @SubscribeMessage(LobbyCommand.StartGame)
  async wsLobbyStartGameListener(socket: Socket, startGameMessage: LobbyCommandStartGame): Promise<void> {
    console.log('LOBBY GATEWAY - START GAME MESSAGE RECIEVED');
    // Check that player is host, if true -> Update the game (status -> in progress), Emit Move to Game to the game room
    const someEvents = await this.gameLobbyService.handleStartGameMessage();
    return
  }
}