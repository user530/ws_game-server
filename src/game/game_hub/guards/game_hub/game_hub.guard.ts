import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Namespace } from 'socket.io';

@Injectable()
export class GameHubGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Namespace>();

    const { server } = client;
    const { userId } = (client as any)?.handshake?.auth;

    if (!server || !userId)
      return false;

    // Iterate over all server namespaces 
    for (const nsp of server._nsps.values()) {
      // Get namespace rooms
      const { adapter: { rooms } } = nsp;

      // For each namespace check all rooms
      for (const roomName of rooms.keys()) {
        // If there is a room name with ID value -> means user is already logged, block access
        if (userId === roomName)
          return false;
      }
    }

    return true;
  }
}
