import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { GameInstanceService } from '../services/game_instance/game_instance.service';
import { MakeTurnDTO, ForfeitMatchDTO } from '../dtos';
import { ExecutionContext, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatMessagesHandler, GameInstanceMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { ChatCommand, GameCommand } from '@user530/ws_game_shared/types';
import { GameInstanceGuard } from '../guards/game_instance/game_instance.guard';
import { GameChatService } from 'src/game/game_chat/services/game_chat/game_chat.service';
import { SendMessageDTO } from 'src/game/game_chat/dtos/send-message.dto';
import { ChatLayer } from 'src/database/entities/message.entity';
import { TargetedEvent } from 'src/game/game_chat/interfaces';
import { ChatEventNewMessage } from '@user530/ws_game_shared/interfaces/ws-events';

@WebSocketGateway({
  path: process.env.ENV_WS_PATH || '/socket.io',
  cors: '*',
  namespace: '/game'
})
@UsePipes(new ValidationPipe())
export class GameInstanceGateway implements OnGatewayConnection, GameInstanceMessagesHandler, ChatMessagesHandler {
  @WebSocketServer()
  private SocketNamespace: Namespace;

  constructor(
    private readonly gameInstanceService: GameInstanceService,
    private readonly gameInstanceGuard: GameInstanceGuard,
    private readonly gameChatService: GameChatService,
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    // Skip connection logic on reconnect
    if (client.recovered)
      return;

    const isValid = await this.gameInstanceGuard.canActivate(
      {
        switchToWs: () => ({ getClient: () => client })
      } as ExecutionContext
    );

    // HANDLE FAILED GAME AUTHENTICATION - PLACEHOLDER
    if (!isValid)
      return client.disconnect();

    // Initial connection logic
    const { gameId, userId } = client.handshake.auth;

    const turnEvents = await this.gameInstanceService.handleConnection(gameId);

    // Register socket by userId, and join the game room
    client.join([userId, gameId]);

    // Error event
    if (!Array.isArray(turnEvents))
      return client.emit(turnEvents.type, turnEvents);

    // Return to client all game turns
    turnEvents.forEach((turnEvent) => client.emit(turnEvent.command, turnEvent));

    // Load messages on game connection
    const gameMessages = await this.gameChatService.handleGameConnection({ userId, gameRoomId: gameId });

    // If it is not and array of messages -> it is a targeted error chat event
    if (!Array.isArray(gameMessages)) {
      const { event } = gameMessages;
      return client.emit(event.command, event);
    }
    // If no error -> emit all messages back to the client
    else
      return gameMessages.forEach(msg => client.emit(msg.command, msg));
  }

  @SubscribeMessage(GameCommand.MakeTurn)
  async wsGameMakeTurnListener(@ConnectedSocket() client: Socket, @MessageBody() payload: MakeTurnDTO): Promise<void> {
    const turnResultEvents = await this.gameInstanceService.handleMakeTurnMessage(payload);

    const { gameId } = payload.data;

    // Turn that ended the game
    if (Array.isArray(turnResultEvents))
      turnResultEvents.forEach(event => this.SocketNamespace.to(gameId).emit(event.command, event));

    // Regular turn
    else if (turnResultEvents.type === 'game_event')
      this.SocketNamespace.to(gameId).emit(turnResultEvents.command, turnResultEvents);

    // Error -> Emit to sender
    else
      client.emit(turnResultEvents.type, turnResultEvents);
  }

  @SubscribeMessage(GameCommand.ForfeitMatch)
  async wsGameForfeitListener(@ConnectedSocket() client: Socket, @MessageBody() payload: ForfeitMatchDTO): Promise<void> {
    const forfeitEvent = await this.gameInstanceService.handleForfeitMessage(payload);

    const { gameId } = payload.data;

    // Forfeit event
    if (forfeitEvent.type === 'game_event')
      this.SocketNamespace.to(gameId).emit(forfeitEvent.command, forfeitEvent);

    // Error -> Emit to sender
    else
      client.emit(forfeitEvent.type, forfeitEvent);
  }

  @SubscribeMessage(ChatCommand.SendMessage)
  async wsChatSendMsgListener(@ConnectedSocket() client: Socket, @MessageBody() sendMsgMessage: SendMessageDTO): Promise<void> {
    const { gameId } = client.handshake.auth;
    const { data } = sendMsgMessage;

    // Prepare layer context
    const contextData = { layer: ChatLayer.Game, roomId: gameId };

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
      this.SocketNamespace.server.of(ChatLayer.Game).to(gameId).emit(
        generalEvent.command,
        generalEvent,
      );
    }
  }
}