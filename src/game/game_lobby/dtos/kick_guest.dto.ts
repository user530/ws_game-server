import { LobbyCommandKickData, LobbyCommandKickGuest } from '@user530/ws_game_shared/interfaces/ws-messages';
import { LobbyCommand, MessageType } from '@user530/ws_game_shared/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';

export class KickGuestDataType implements LobbyCommandKickData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    playerId: string;
}

export class KickGuestDTO implements LobbyCommandKickGuest {
    @IsNotEmpty()
    @IsNumber()
    @Equals(1)
    version: 1;

    @IsNotEmpty()
    @IsEnum(MessageType)
    @Equals(MessageType.LobbyCommand)
    type: MessageType.LobbyCommand;

    @IsNotEmpty()
    @IsEnum(LobbyCommand)
    @Equals(LobbyCommand.KickGuest)
    command: LobbyCommand.KickGuest;

    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => KickGuestDataType)
    data: KickGuestDataType;
}