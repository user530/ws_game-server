import { Injectable } from '@nestjs/common';
import { LobbyEventGuestJoined, LobbyEventGuestLeft, LobbyEventMovedToGame, LobbyEventMovedToHub, ErrorEvent } from '@user530/ws_game_shared/interfaces/ws-events';

interface IGameLobbyService {
    handleConnection(): Promise<void>;
    handleLeaveLobbyMessage(): Promise<void>;
    handleKickGuestMessage(): Promise<void>;
    handleStartGameMessage(): Promise<void>;
}

@Injectable()
export class GameLobbyService implements IGameLobbyService {
    async handleConnection(): Promise<void> {
        console.log('Game Lobby Service - Handle Connection Fired');
        return
    }

    async handleLeaveLobbyMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Leave Lobby Message Fired');
        return
    }

    async handleKickGuestMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Kick Guest Message Fired');
        return
    }

    async handleStartGameMessage(): Promise<void> {
        console.log('Game Lobby Service - Handle Start Game Message Fired');
        return
    }
}
