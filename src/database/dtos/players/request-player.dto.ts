import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class RequestPlayerByIdDTO {
    @IsNotEmpty()
    @IsUUID()
    id: string;
}

export class RequestPlayerByNameDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(12)
    name: string;
}