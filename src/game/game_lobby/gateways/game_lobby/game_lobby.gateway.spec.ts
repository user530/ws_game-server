import { Test, TestingModule } from '@nestjs/testing';
import { GameLobbyGateway } from './game_lobby.gateway';

describe('GameLobbyGateway', () => {
  let gateway: GameLobbyGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameLobbyGateway],
    }).compile();

    gateway = module.get<GameLobbyGateway>(GameLobbyGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
