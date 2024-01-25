import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { HubCredentials } from '@user530/ws_game_shared/interfaces/general';

export class HubAuthDTO implements HubCredentials {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;
}