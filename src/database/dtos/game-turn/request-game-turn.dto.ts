import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestGameTurnDTO {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;
}