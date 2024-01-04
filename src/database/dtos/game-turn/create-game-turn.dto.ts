import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { GameTableRow, GameTableCol } from '@user530/ws_game_shared/enums';

export class CreateGameTurnDTO {
    @IsNotEmpty()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsUUID()
    playerId: string;

    @IsNotEmpty()
    @IsEnum(GameTableRow)
    row: GameTableRow;

    @IsNotEmpty()
    @IsEnum(GameTableCol)
    column: GameTableCol;
}