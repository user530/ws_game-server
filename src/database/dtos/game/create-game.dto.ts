import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGameDTO {
    @IsNotEmpty()
    @IsUUID()
    hostId: string;
}