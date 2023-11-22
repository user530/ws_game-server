import { Type } from 'class-transformer';
import { GameCommandMakeTurn, GameCommandDataType as IGameCommandData } from '@user530/ws_game_shared/interfaces';
import { GameTableCol, GameTableRow } from '@user530/ws_game_shared/enums';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

class GameCommandDataType implements IGameCommandData {
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

export class MakeTurnDTO implements GameCommandMakeTurn {
    @IsNotEmpty()
    @IsNumber()
    @Equals(1)
    version: 1;

    @IsNotEmpty()
    @IsString()
    @Equals('game_command')
    type: 'game_command';

    @IsNotEmpty()
    @IsString()
    @Equals('make_turn')
    command: 'make_turn';

    @IsObject()
    @ValidateNested()
    @Type(() => GameCommandDataType)
    data: GameCommandDataType;
}