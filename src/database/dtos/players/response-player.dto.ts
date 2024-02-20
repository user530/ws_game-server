import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ResponsePlayerDTO {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsString()
    name: string;
}