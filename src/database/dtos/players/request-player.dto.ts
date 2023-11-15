import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class RequestPlayerDTO {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    id: number;
}