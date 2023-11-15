import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePlayerDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(12)
    name: string;
}