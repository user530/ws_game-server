import { ChatCommandSendMessage, ChatCommandSendMsgData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { ChatCommand, MessageType } from '@user530/ws_game_shared/types';
import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, Length, ValidateNested } from 'class-validator';

class SendMessageDataType implements ChatCommandSendMsgData {
    @IsNotEmpty()
    @IsUUID()
    user: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 255)
    message: string;
}

export class SendMessageDTO implements ChatCommandSendMessage {
    @IsNotEmpty()
    @IsNumber()
    @Equals(1)
    version: 1;


    @IsNotEmpty()
    @IsEnum(MessageType)
    @Equals(MessageType.ChatCommand)
    type: MessageType.ChatCommand;

    @IsNotEmpty()
    @IsEnum(ChatCommand)
    @Equals(ChatCommand.SendMessage)
    command: ChatCommand;


    @IsObject()
    @ValidateNested()
    @Type(() => SendMessageDataType)
    data: SendMessageDataType;
}