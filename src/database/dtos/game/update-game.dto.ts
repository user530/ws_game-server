import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { GameStatus } from 'src/shared/enums/game';

export class UpdateGameStatusDTO {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;

    @IsNotEmpty()
    @IsEnum(GameStatus)
    new_status: GameStatus;
}