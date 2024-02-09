import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ChatLayer } from 'src/database/entities/message.entity';

export class CreateGeneralMessageDTO {
    @IsNotEmpty()
    @IsUUID()
    authorId: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 255)
    message: string;


    @IsNotEmpty()
    @IsEnum(ChatLayer)
    layer: ChatLayer;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    roomId: string | null;
}