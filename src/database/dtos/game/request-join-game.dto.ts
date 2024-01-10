import { IsNotEmpty, IsUUID } from 'class-validator'

export class RequestJoinGameDTO {
    @IsNotEmpty()
    @IsUUID()
    guestId: string;

    @IsNotEmpty()
    @IsUUID()
    gameId: string;
}