import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { GameStatus } from '@user530/ws_game_shared/enums';

export class UpdateGameStatusDTO {
    @IsNotEmpty()
    @IsUUID()
    gameId: string;

    @IsNotEmpty()
    @IsEnum(GameStatus)
    newStatus: GameStatus;
}