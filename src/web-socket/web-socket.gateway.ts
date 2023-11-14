import { WebSocketGateway } from '@nestjs/websockets';
import { WebSocketService } from './web-socket.service';

@WebSocketGateway()
export class WebSocketGateway {
  constructor(private readonly webSocketService: WebSocketService) {}
}
