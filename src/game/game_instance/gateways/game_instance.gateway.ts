import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(
  {
    cors: '*',
  }
)
export class GameInstanceGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
