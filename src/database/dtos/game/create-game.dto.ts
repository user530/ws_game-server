import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGameDTO {
    @IsNotEmpty()
    @IsUUID()
    host_id: string;
}