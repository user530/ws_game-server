import { IsNotEmpty, IsUUID } from 'class-validator'

export class RequestJoinGameDTO {
    @IsNotEmpty()
    @IsUUID()
    guest_id: string;

    @IsNotEmpty()
    @IsUUID()
    host_id: string;
}