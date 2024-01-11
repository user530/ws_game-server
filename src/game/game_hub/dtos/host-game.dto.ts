
import { HubCommandHostData, HubCommandHostGame } from '@user530/ws_game_shared/interfaces/ws-messages';
import { HubCommand, MessageType } from '@user530/ws_game_shared/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsUUID, ValidateNested } from 'class-validator';

class HostGameDataType implements HubCommandHostData {
    @IsNotEmpty()
    @IsUUID()
    playerId: string;
}

export class HostGameDTO implements HubCommandHostGame {
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
    @Equals(HubCommand.HostGame)
    command: HubCommand.HostGame;

    @IsObject()
    @ValidateNested()
    @Type(() => HostGameDataType)
    data: HostGameDataType;
}