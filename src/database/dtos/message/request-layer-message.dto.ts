import { Equals, IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ChatLayer } from 'src/database/entities/message.entity';

export class RequestHubMessageDTO {
    @IsNotEmpty()
    @IsEnum(ChatLayer)
    @Equals(ChatLayer.Hub)
    layer: ChatLayer.Hub;
}

export class RequestRoomMessageDTO {
    @IsNotEmpty()
    @IsEnum(ChatLayer)
    @IsIn([ChatLayer.Lobby, ChatLayer.Game])
    layer: ChatLayer.Lobby | ChatLayer.Game;

    @IsNotEmpty()
    @IsString()
    roomId: string;
}