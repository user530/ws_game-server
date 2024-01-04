import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestPlayerGamesDTO {
    @IsNotEmpty()
    @IsUUID()
    playerId: string;
}