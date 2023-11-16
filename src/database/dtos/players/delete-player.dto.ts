import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeletePlayerDTO {
    @IsNotEmpty()
    @IsUUID()
    id: string;
}