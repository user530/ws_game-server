import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePlayerDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(12)
    name: string;
}