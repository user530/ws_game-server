import { Module } from '@nestjs/common';
import { GameLobbyGateway } from './gateways/game_lobby/game_lobby.gateway';
import { GameLobbyService } from './services/game_lobby/game_lobby.service';
import { GameLobbyEventsService } from './services/game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from './services/lobby_logic/lobby_logic.service';

@Module({
    imports: [],
    providers: [
        GameLobbyGateway,
        GameLobbyService,
        GameLobbyEventsService,
        LobbyLogicService,
    ],
})
export class GameLobbyModule { }
