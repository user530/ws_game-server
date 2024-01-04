import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GameStatus } from '@user530/ws_game_shared/enums';
import { Socket } from 'socket.io';
import { GameService } from 'src/database/services';

@Injectable()
export class GameInstanceGuard implements CanActivate {

  constructor(
    private readonly gameService: GameService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      console.log('Game Instance guard fired!');

      const client = context.switchToWs().getClient<Socket>();

      const { userId, gameId } = client.handshake.auth;

      if (!userId || !gameId)
        return false;

      console.log('Found Auth credentials');

      const isValidUser = await this.isValidUser(userId, gameId);

      console.log('User is valid - ', isValidUser);

      return isValidUser;
    } catch (error) {
      console.log('Game Instance Guard - Error!');
      return false
    }
  }

  async isValidUser(userId: string, gameId: string): Promise<boolean> {
    console.log('Is valid user fired');
    console.log(userId, gameId)

    const game = await this.gameService.getGameById({ gameId });

    if (!game)
      return false;
    console.log('is valid user, game found')

    if (game.status !== GameStatus.InProgress)
      return false;
    console.log('is valid user, game status is ok')
    if (userId !== game.host.id && userId !== game.guest.id)
      return false;
    console.log('user is valid')
    return true;
  }
}
