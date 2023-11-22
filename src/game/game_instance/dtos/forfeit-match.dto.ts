import { Type } from 'class-transformer';
import { GameCommandForfeit, GameCommandDataType as IGameCommandData } from '@user530/ws_game_shared/interfaces'
import { Equals, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

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
    @IsString()
    @Equals('game_command')
    type: 'game_command';

    @IsNotEmpty()
    @IsString()
    @Equals('forfeit_match')
    command: 'forfeit_match';

    @IsObject()
    @ValidateNested()
    @Type(() => GameCommandDataType)
    data: GameCommandDataType;
}