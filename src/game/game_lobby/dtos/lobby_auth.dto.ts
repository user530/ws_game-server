import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { LobbyCredentials } from '@user530/ws_game_shared/interfaces/general';

export class LobbyAuthDTO implements LobbyCredentials {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    gameId: string;
}