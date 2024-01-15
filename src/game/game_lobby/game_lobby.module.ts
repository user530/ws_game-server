import { Module } from '@nestjs/common';
import { GameLobbyGateway } from './gateways/game_lobby/game_lobby.gateway';
import { GameLobbyService } from './services/game_lobby/game_lobby.service';
import { GameLobbyEventsService } from './services/game_lobby_events/game_lobby_events.service';

@Module({
    imports: [],
    providers: [
        GameLobbyGateway,
        GameLobbyService,
    ],
})
export class GameLobbyModule { }
