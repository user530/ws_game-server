import { Type } from 'class-transformer';
import { GameCommandMakeTurn, GameCommandDataType as IGameCommandData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { GameTableCol, GameTableRow } from '@user530/ws_game_shared/enums';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { GameCommand, MessageType } from '@user530/ws_game_shared/types';

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
    @IsEnum(MessageType)
    type: MessageType.GameCommand;

    @IsNotEmpty()
    @IsEnum(GameCommand)
    command: GameCommand.MakeTurn;

    @IsObject()
    @ValidateNested()
    @Type(() => GameCommandDataType)
    data: GameCommandDataType;
}