import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestDmDTO {
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}