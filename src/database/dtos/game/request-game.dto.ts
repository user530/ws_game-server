import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestGameDTO {
    @IsNotEmpty()
    @IsUUID()
    gameId: string;
}