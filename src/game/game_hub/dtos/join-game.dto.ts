import { HubCommandJoinData, HubCommandJoinGame } from '@user530/ws_game_shared/interfaces/ws-messages';
import { HubCommand, MessageType } from '@user530/ws_game_shared/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

class JoinGameDataType implements HubCommandJoinData {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    playerId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    lobbyId: string;
}

export class JoinGameDTO implements HubCommandJoinGame {
    @IsNotEmpty()
    @IsNumber()
    @Equals(1)
    version: 1;

    @IsNotEmpty()
    @IsEnum(MessageType)
    @Equals(MessageType.HubCommand)
    type: MessageType.HubCommand;

    @IsNotEmpty()
    @IsEnum(HubCommand)
    @Equals(HubCommand.JoinGame)
    command: HubCommand.JoinGame;

    @IsObject()
    @ValidateNested()
    @Type(() => JoinGameDataType)
    data: JoinGameDataType;
}