import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { GameLobbyMessagesHandler } from '@user530/ws_game_shared/interfaces/ws-listeners';
import { LobbyCommandKickGuest, LobbyCommandLeaveLobby, LobbyCommandStartGame } from '@user530/ws_game_shared/interfaces/ws-messages';
import { LobbyCommand } from '@user530/ws_game_shared/types';
import { GameLobbyService } from '../../services/game_lobby/game_lobby.service';

@WebSocketGateway({
  cors: '*',
  namespace: '/lobby',
})
export class GameLobbyGateway implements GameLobbyMessagesHandler, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly gameLobbyService: GameLobbyService
  ) { }

  async handleConnection(client: any) {
    console.log('LOBBY GATEWAY - CONNECTION ESTABLISHED');
    const someEvents = await this.gameLobbyService.handleConnection();
    return
  }

  handleDisconnect(client: any) {
    console.log('LOBBY GATEWAY - CONNECTION CLOSED');
    return
  }

  @SubscribeMessage(LobbyCommand.LeaveLobby)
  async wsLobbyLeaveLobbyListener(socket: unknown, leaveLobbyMessage: LobbyCommandLeaveLobby): Promise<void> {
    console.log('LOBBY GATEWAY - LEAVE LOBBY MESSAGE RECIEVED');
    const someEvents = await this.gameLobbyService.handleLeaveLobbyMessage();
    return
  }

  @SubscribeMessage(LobbyCommand.KickGuest)
  async wsLobbyKickGuestListener(socket: unknown, kickGuestMessage: LobbyCommandKickGuest): Promise<void> {
    console.log('LOBBY GATEWAY - KICK GUEST MESSAGE RECIEVED');
    const someEvents = await this.gameLobbyService.handleKickGuestMessage();
    return
  }

  @SubscribeMessage(LobbyCommand.StartGame)
  async wsLobbyStartGameListener(socket: unknown, startGameMessage: LobbyCommandStartGame): Promise<void> {
    console.log('LOBBY GATEWAY - START GAME MESSAGE RECIEVED');
    const someEvents = await this.gameLobbyService.handleStartGameMessage();
    return
  }
}
