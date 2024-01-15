import { Test, TestingModule } from '@nestjs/testing';
import { GameLobbyEventsService } from './game_lobby_events.service';

describe('GameLobbyEventsService', () => {
  let service: GameLobbyEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameLobbyEventsService],
    }).compile();

    service = module.get<GameLobbyEventsService>(GameLobbyEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
