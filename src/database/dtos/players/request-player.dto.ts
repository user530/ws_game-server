import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RequestPlayerDTO {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    id: string;
}