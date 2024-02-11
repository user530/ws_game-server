import { Module } from '@nestjs/common';
import { GameLobbyGateway } from './gateways/game_lobby/game_lobby.gateway';
import { GameLobbyService } from './services/game_lobby/game_lobby.service';
import { GameLobbyEventsService } from './services/game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from './services/lobby_logic/lobby_logic.service';
import { DatabaseModule } from 'src/database/database.module';
import { HubLogicService } from '../game_hub/services/hub_logic/hub_logic.service';
import { GameChatModule } from '../game_chat/game_chat.module';


@Module({
    imports: [DatabaseModule, GameChatModule],
    providers: [
        GameLobbyGateway,
        GameLobbyService,
        GameLobbyEventsService,
        LobbyLogicService,
        HubLogicService,
    ],
})
export class GameLobbyModule { }
