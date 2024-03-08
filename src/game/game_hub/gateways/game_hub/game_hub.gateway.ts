import { SubscribeMessage, ConnectedSocket, WebSocketGateway, OnGatewayConnection, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatMessagesHandler, GameHubMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { ChatCommand, HubCommand, HubEvent, MessageType } from '@user530/ws_game_shared/types';
import { Socket, Namespace } from 'socket.io';
import { GameHubService } from '../../services/game_hub/game_hub.service';
import { HostGameDTO, JoinGameDTO } from '../../dtos';
import { ExecutionContext, UsePipes, ValidationPipe } from '@nestjs/common';
import { GameChatService } from 'src/game/game_chat/services/game_chat/game_chat.service';
import { ChatLayer } from 'src/database/entities/message.entity';
import { TargetedEvent } from 'src/game/game_chat/interfaces';
import { ChatEventNewMessage } from '@user530/ws_game_shared/interfaces/ws-events';
import { SendMessageDTO } from 'src/game/game_chat/dtos/send-message.dto';
import { GameHubGuard } from '../../guards/game_hub/game_hub.guard';

@WebSocketGateway({
  path: process.env.ENV_WS_PATH || '/socket.io',
  cors: '*',
  namespace: '/hub',
})
@UsePipes(new ValidationPipe())
export class GameHubGateway implements OnGatewayConnection, GameHubMessagesHandler, ChatMessagesHandler {
  @WebSocketServer()
  private readonly SocketNamespace: Namespace;

  constructor(
    private readonly gameHubService: GameHubService,
    private readonly gameChatService: GameChatService,
    private readonly gameHubGuard: GameHubGuard,
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    // Skip connection logic on reconnect
    if (client.recovered)
      return;

    // Check if there is no existing connections with client credentials (manually, because HandleConnection doesn't work with UseGuards) 
    const canConnect = this.gameHubGuard.canActivate(
      {
        switchToWs: () => ({ getClient: () => client })
      } as ExecutionContext
    );

    // If user with this ID is already connected, disconnect client
    if (!canConnect) {
      const leftHubEvent = await this.gameHubService.handleLeaveHubMessage();
      return client.emit(leftHubEvent.command);
    }

    // Initial connection logic
    const { userId } = client.handshake.auth;

    // Register socket by userId
    client.join(userId);

    // Decide on the required event
    const gamesUpdatedEvent = await this.gameHubService.handleConnection({ userId });

    // Error event is emmited back to the client
    if (gamesUpdatedEvent.type === MessageType.ErrorMessage)
      return client.emit(gamesUpdatedEvent.type, gamesUpdatedEvent);

    // Emit layer change 
    if (
      gamesUpdatedEvent.command === HubEvent.MovedToGame
      || gamesUpdatedEvent.command === HubEvent.MovedToLobby
    )
      return client.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);

    // User stays in the Hub layer, update the list of the games
    client.emit(gamesUpdatedEvent.command, gamesUpdatedEvent);

    // Load messages on hub connection
    const hubMessages = await this.gameChatService.handleHubConnection({ userId });

    // If it is not and array of messages -> it is a targeted error chat event
    if (!Array.isArray(hubMessages)) {
      const { event } = hubMessages;
      return client.emit(event.command, event);
    }
    // If no error -> emit all messages back to the client
    else {
      return hubMessages.forEach(msg => client.emit(msg.command, msg));
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

  @SubscribeMessage(ChatCommand.SendMessage)
  async wsChatSendMsgListener(@ConnectedSocket() client: Socket, @MessageBody() sendMsgMessage: SendMessageDTO): Promise<void> {
    const { data } = sendMsgMessage;
    // Prepare layer context
    const contextData = { layer: ChatLayer.Hub, roomId: null };
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

      // Emit general message to all players in Hub layer
      this.SocketNamespace.server.of(ChatLayer.Hub).emit(
        generalEvent.command,
        generalEvent,
      )
    }
  }
}
