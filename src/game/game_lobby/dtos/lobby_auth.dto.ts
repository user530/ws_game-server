import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LobbyAuthData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    gameId: string;
}