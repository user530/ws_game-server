import { Test, TestingModule } from '@nestjs/testing';
import { GameChatEventsService } from './game_chat_events.service';

describe('GameChatEventsService', () => {
  let service: GameChatEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameChatEventsService],
    }).compile();

    service = module.get<GameChatEventsService>(GameChatEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
