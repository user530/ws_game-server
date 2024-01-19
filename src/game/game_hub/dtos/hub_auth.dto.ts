import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class HubAuthDTO {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;
}