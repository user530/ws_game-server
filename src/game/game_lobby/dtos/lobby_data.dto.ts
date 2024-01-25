import { GameStatus, GameTableCol, GameTableRow } from '@user530/ws_game_shared/enums';
import { Type } from 'class-transformer';
import { Equals, IsArray, IsEnum, IsIn, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { HostData, GuestData, StoreGameData, TurnData } from '@user530/ws_game_shared/interfaces/general';

class LobbyHostData implements HostData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    hostId: string;

    @IsNotEmpty()
    @IsString()
    hostName: string;
}

class LobbyGuestData implements GuestData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    guestId: string;

    @IsNotEmpty()
    @IsString()
    guestName: string;
}

class LobbyTurnData implements TurnData {
    @IsNotEmpty()
    @IsEnum(GameTableCol)
    column: GameTableCol;

    @IsNotEmpty()
    @IsEnum(GameTableRow)
    row: GameTableRow;

    @IsNotEmpty()
    @IsString()
    @IsIn(['X', 'O'])
    mark: 'X' | 'O';
}

export class LobbyDataDTO implements StoreGameData {
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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LobbyTurnData)
    turns: LobbyTurnData[];
}

export class ActiveLobbyDataDTO extends LobbyDataDTO {
    @IsOptional()
    @ValidateNested()
    @Type(() => LobbyGuestData)
    guest: LobbyGuestData;

    @IsNotEmpty()
    @IsEnum(GameStatus)
    @Equals(GameStatus.InProgress)
    status: GameStatus.InProgress;
}