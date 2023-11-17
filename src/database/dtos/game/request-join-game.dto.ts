import { IsNotEmpty, IsUUID } from 'class-validator'

export class RequestJoinGameDTO {
    @IsNotEmpty()
    @IsUUID()
    client_id: string;

    @IsNotEmpty()
    @IsUUID()
    host_id: string;
}