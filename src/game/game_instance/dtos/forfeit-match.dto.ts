import { Type } from 'class-transformer';
import { GameCommandForfeit, GameCommandDataType as IGameCommandData } from '@user530/ws_game_shared/interfaces/ws-messages';
import { Equals, IsEnum, IsNotEmpty, IsNumber, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { GameCommand, MessageType } from '@user530/ws_game_shared/types';

class GameCommandDataType implements Pick<IGameCommandData, 'game_id' | 'player_id'> {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;

    @IsNotEmpty()
    @IsUUID()
    player_id: string;
}

export class ForfeitMatchDTO implements GameCommandForfeit {
    @IsNotEmpty()
    @IsNumber()
    @Equals(1)
    version: 1;

    @IsNotEmpty()
    @IsEnum(MessageType)
    type: MessageType.GameCommand;

    @IsNotEmpty()
    @IsEnum(GameCommand)
    command: GameCommand.ForfeitMatch;

    @IsObject()
    @ValidateNested()
    @Type(() => GameCommandDataType)
    data: GameCommandDataType;
}