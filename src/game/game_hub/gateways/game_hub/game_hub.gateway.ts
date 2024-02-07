import { SubscribeMessage, ConnectedSocket, WebSocketGateway, OnGatewayConnection, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ChatMessagesHandler, GameHubMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { ChatCommand, HubCommand, MessageType } from '@user530/ws_game_shared/types';
import { Socket, Namespace } from 'socket.io';
import { GameHubService } from '../../services/game_hub/game_hub.service';
import { HostGameDTO, JoinGameDTO } from '../../dtos';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatCommandSendMessage } from '@user530/ws_game_shared/interfaces/ws-messages';
import { createChatNewMsgEvent } from '@user530/ws_game_shared/creators/events';

@WebSocketGateway({
  cors: '*',
  namespace: '/hub'
})
@UsePipes(new ValidationPipe())
export class GameHubGateway implements OnGatewayConnection, GameHubMessagesHandler, ChatMessagesHandler {
  @WebSocketServer()
  private readonly SocketNamespace: Namespace;

  constructor(
    private readonly gameHubService: GameHubService
  ) { }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const { userId } = client.handshake.auth;
    console.log('HUB HANDLE CONNECTION. USER ID: ', userId)
    const gamesUpdatedEvent = await this.gameHubService.handleConnection({ userId });
    // console.log('ALL SOCKETS:')
    // console.log(this.SocketNamespace.server)
    // for (const [id, singleSocket] of this.SocketNamespace.sockets.entries()) {
    //   console.log(`${id} - ${singleSocket.handshake.auth['userId']}`)
    // }
    const messages: any = await this.gameHubService.test(userId);
    console.log('MESSAGES!');
    console.log(messages);

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
  // DONT FORGET TO CHANGE BODY TO DTO          !!!
  @SubscribeMessage(ChatCommand.SendMessage)
  async wsChatSendMsgListener(@ConnectedSocket() socket: Socket, @MessageBody() sendMsgMessage: ChatCommandSendMessage): Promise<void> {
    console.log('HUB SOCKET - SEND CHAT MSG RECIEVED');
    const { data: { message, user } } = sendMsgMessage;
    console.log(`User ${user} sent: ${message}`);

    // PLACEHOLDER
    // 1 Check that user name is same as his Auth credential
    // 2 Save timestamp
    // 3 Check if it is whisper
    // 4 Create Event and emit

    console.log(socket.handshake.auth.userId);

    // const time = new Date();
    // const messageEvent = createChatNewMsgEvent(
    //   {
    //     timestamp: [
    //       time.getHours(),
    //       time.getMinutes()
    //     ],
    //     user,
    //     message,
    //     isWhisper: Math.round(Math.random()) === 1
    //   })
    // this.SocketNamespace.emit(messageEvent.command, messageEvent);
  }
}
