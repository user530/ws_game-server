import { Module } from '@nestjs/common';
import { GameLobbyGateway } from './gateways/game_lobby/game_lobby.gateway';
import { GameLobbyService } from './services/game_lobby/game_lobby.service';
import { GameLobbyEventsService } from './services/game_lobby_events/game_lobby_events.service';
import { LobbyLogicService } from './services/lobby_logic/lobby_logic.service';
import { GameService, PlayerService } from 'src/database/services';
import { DatabaseModule } from 'src/database/database.module';
import { HubLogicService } from '../game_hub/services/hub_logic/hub_logic.service';


@Module({
    imports: [DatabaseModule],
    providers: [
        GameLobbyGateway,
        GameLobbyService,
        GameLobbyEventsService,
        LobbyLogicService,
        HubLogicService,
        GameService,
        PlayerService,
    ],
})
export class GameLobbyModule { }
