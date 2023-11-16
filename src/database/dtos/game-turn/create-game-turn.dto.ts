import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { GameTableRow, GameTableCol } from 'src/shared/enums/game-turn';

export class CreateGameTurnDTO {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;

    @IsNotEmpty()
    @IsUUID()
    player_id: string;

    @IsNotEmpty()
    @IsEnum(GameTableRow)
    row: GameTableRow;

    @IsNotEmpty()
    @IsEnum(GameTableCol)
    column: GameTableCol;
}