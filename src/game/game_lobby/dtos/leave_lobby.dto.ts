import { LobbyCommandLeaveLobby, LobbyCommandLeaveData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { LobbyCommand, MessageType } from '@user530/ws_game_shared/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

export class LeaveLobbyDataType implements LobbyCommandLeaveData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    playerId: string;
}

export class LeaveLobbyDTO implements LobbyCommandLeaveLobby {
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
    @Equals(LobbyCommand.LeaveLobby)
    command: LobbyCommand.LeaveLobby;

    @IsObject()
    @ValidateNested()
    @Type(() => LeaveLobbyDataType)
    data: LeaveLobbyDataType;
}