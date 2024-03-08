import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { ChatMessagesHandler, GameLobbyMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { ChatCommand, LobbyCommand, LobbyEvent, MessageType } from '@user530/ws_game_shared/types';
import { GameLobbyService } from '../../services/game_lobby/game_lobby.service';
import { Socket, Namespace } from 'socket.io';
import { KickGuestDTO, LeaveLobbyDTO, StartGameDTO } from '../../dtos';
import { SendMessageDTO } from 'src/game/game_chat/dtos/send-message.dto';
import { ChatLayer } from 'src/database/entities/message.entity';
import { GameChatService } from 'src/game/game_chat/services/game_chat/game_chat.service';
import { TargetedEvent } from 'src/game/game_chat/interfaces';
import { ChatEventNewMessage } from '@user530/ws_game_shared/interfaces/ws-events';

@WebSocketGateway({
  path: process.env.ENV_WS_PATH || '/socket.io',
  cors: '*',
  namespace: '/lobby',
})
export class GameLobbyGateway implements GameLobbyMessagesHandler, OnGatewayConnection, ChatMessagesHandler {
  @WebSocketServer()
  private SocketNamespace: Namespace;

  constructor(
    private readonly gameLobbyService: GameLobbyService,
    private readonly gameChatService: GameChatService,
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    // Skip connection logic on reconnect
    if (client.recovered)
      return;

    // Initial connection logic
    const { gameId, userId } = client.handshake.auth;

    // Decide on the required event
    const connectionEvent = await this.gameLobbyService.handleConnection({ gameId, userId });

    // Handle Unauthorized connection (error+move) event pair
    if (Array.isArray(connectionEvent)) {
      const [errEvent, moveEvent] = connectionEvent;
      client.emit(errEvent.type, errEvent);
      client.emit(moveEvent.command, moveEvent);
      return;
    }

    // Emit layer change 
    if (connectionEvent?.command === LobbyEvent.MovedToGame)
      return client.emit(connectionEvent.command, connectionEvent);


    // Register socket by userId, and join the game room
    client.join([userId, gameId]);

    // Handle Guest connection -> broadcast to the room "Join event"
    if (connectionEvent?.command === LobbyEvent.GuestJoined) {
      client.broadcast.to(gameId).emit(connectionEvent.command, connectionEvent)
    }

    // Host connected, no special interaction required
    if (connectionEvent === null) { }

    // Load messages on lobby connection
    const lobbyMessages = await this.gameChatService.handleLobbyConnection({ userId, lobbyRoomId: gameId });

    // If it is not and array of messages -> it is a targeted error chat event
    if (!Array.isArray(lobbyMessages)) {
      const { event } = lobbyMessages;
      return client.emit(event.command, event);
    }
    // If no error -> emit all messages back to the client
    else
      return lobbyMessages.forEach(msg => client.emit(msg.command, msg));
  }

  @SubscribeMessage(LobbyCommand.LeaveLobby)
  async wsLobbyLeaveLobbyListener(@ConnectedSocket() client: Socket, @MessageBody() leaveLobbyMessage: LeaveLobbyDTO): Promise<void> {
    const { gameId } = client.handshake.auth;
    const { data } = leaveLobbyMessage;

    const leaveEvents = await this.gameLobbyService.handleLeaveLobbyMessage(data);

    // Handle guest leave
    if (Array.isArray(leaveEvents) && leaveEvents.length === 3) {
      const [guestEvent, hostEvent, hubEvent] = leaveEvents;

      // Emit respective events
      client.emit(guestEvent.command, guestEvent);
      client.broadcast.to(gameId).emit(hostEvent.command, hostEvent);

      // Refresh the lobby list for the players in the hub
      this.SocketNamespace.server.of(ChatLayer.Hub).emit(hubEvent.command, hubEvent);
    }
    // Handle host leave
    else if (Array.isArray(leaveEvents) && leaveEvents.length === 2) {
      const [roomEvent, hubEvent] = leaveEvents;

      // Emit leave event to both
      this.SocketNamespace.to(gameId).emit(roomEvent.command, roomEvent);

      // Emit hub event in case lobby was open
      this.SocketNamespace.server.of(ChatLayer.Hub).emit(hubEvent.command, hubEvent);
    }
    // Handle error event
    else
      client.emit(leaveEvents.type, leaveEvents);
  }

  @SubscribeMessage(LobbyCommand.KickGuest)
  async wsLobbyKickGuestListener(@ConnectedSocket() client: Socket, @MessageBody() kickGuestMessage: KickGuestDTO): Promise<void> {
    const { gameId } = client.handshake.auth;
    const { data } = kickGuestMessage;

    // Prepare kick guest event
    const kickEvents = await this.gameLobbyService.handleKickGuestMessage(data);

    // Handle normal behaviour
    if (Array.isArray(kickEvents)) {
      const [guestEvent, hostEvent, hubEvent] = kickEvents;

      // Emit respective events (This time in reverse because client is host)
      client.broadcast.to(gameId).emit(guestEvent.command, guestEvent);
      client.emit(hostEvent.command, hostEvent);

      // Refresh the lobby list for the players in the hub
      this.SocketNamespace.server.of(ChatLayer.Hub).emit(hubEvent.command, hubEvent);
    }
    // Handle error event
    else
      client.emit(kickEvents.type, kickEvents);
  }

  @SubscribeMessage(LobbyCommand.StartGame)
  async wsLobbyStartGameListener(@ConnectedSocket() client: Socket, @MessageBody() startGameMessage: StartGameDTO): Promise<void> {
    const { gameId } = client.handshake.auth;
    const { data } = startGameMessage;

    // Prepare start game event
    const startEvent = await this.gameLobbyService.handleStartGameMessage(data);

    // Handle normal behaviour
    if (startEvent.type === MessageType.LobbyEvent) {
      this.SocketNamespace.to(gameId).emit(startEvent.command, startEvent);
    }
    // Handle error event
    else {
      client.emit(startEvent.type, startEvent)
    }
  }

  @SubscribeMessage(ChatCommand.SendMessage)
  async wsChatSendMsgListener(@ConnectedSocket() client: Socket, @MessageBody() sendMsgMessage: SendMessageDTO): Promise<void> {
    const { gameId } = client.handshake.auth;
    const { data } = sendMsgMessage;

    // Prepare layer context
    const contextData = { layer: ChatLayer.Lobby, roomId: gameId };

    // Handle message with regards to the layer context
    const msgEvent = await this.gameChatService.handleSendMsgMessage({ contextData, msgData: data });

    // If message is a direct message
    if ((msgEvent as TargetedEvent).targets) {
      const { event, targets } = msgEvent as TargetedEvent;

      //  Emit dm event to targets on all layers
      this.SocketNamespace.server.of(ChatLayer.Hub).to(targets).emit(event.command, event)
      this.SocketNamespace.server.of(ChatLayer.Lobby).to(targets).emit(event.command, event)
      this.SocketNamespace.server.of(ChatLayer.Game).to(targets).emit(event.command, event)
    }
    // If message is the layer message
    else {
      const generalEvent = msgEvent as ChatEventNewMessage;

      // Emit general message to all players in current layer-room
      this.SocketNamespace.server.of(ChatLayer.Lobby).to(gameId).emit(
        generalEvent.command,
        generalEvent,
      )
    }
  }
}
