import { GameStatus } from '@user530/ws_game_shared/enums';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

class LobbyHostData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    hostId: string;

    @IsNotEmpty()
    @IsString()
    hostName: string;
}

class LobbyGuestData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    guestId: string;

    @IsNotEmpty()
    @IsString()
    guestName: string;
}

export class LobbyGameData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    gameId: string;

    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => LobbyHostData)
    host: LobbyHostData;

    @IsOptional()
    @ValidateNested()
    @Type(() => LobbyGuestData)
    guest: null | LobbyGuestData;

    @IsNotEmpty()
    @IsEnum(GameStatus)
    status: GameStatus;
}