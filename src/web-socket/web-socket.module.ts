import { Module } from '@nestjs/common';
import { WebSocketService } from './web-socket.service';
import { WebSocketGateway } from './web-socket.gateway';

@Module({
  providers: [WebSocketGateway, WebSocketService],
})
export class WebSocketModule {}
