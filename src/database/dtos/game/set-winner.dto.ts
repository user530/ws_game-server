import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetWinnerDTO {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;

    @IsNotEmpty()
    @IsUUID()
    player_id: string;
}