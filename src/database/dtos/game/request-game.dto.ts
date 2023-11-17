import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestGameDTO {
    @IsNotEmpty()
    @IsUUID()
    game_id: string;
}