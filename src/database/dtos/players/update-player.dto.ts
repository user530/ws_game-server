import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdatePlayerDTO {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(12)
    name: string;
}