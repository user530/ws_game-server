import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetWinnerDTO {
    @IsNotEmpty()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsUUID()
    playerId: string;
}