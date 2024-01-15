import { Test, TestingModule } from '@nestjs/testing';
import { GameLobbyService } from './game_lobby.service';

describe('GameLobbyService', () => {
  let service: GameLobbyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameLobbyService],
    }).compile();

    service = module.get<GameLobbyService>(GameLobbyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
