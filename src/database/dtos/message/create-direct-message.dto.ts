import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class CreateDirectMessageDTO {
    @IsNotEmpty()
    @IsUUID()
    authorId: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 255)
    message: string;

    @IsNotEmpty()
    @IsString()
    targetName: string;
}