import { Test, TestingModule } from '@nestjs/testing';
import { GameChatService } from './game_chat.service';

describe('GameChatService', () => {
  let service: GameChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameChatService],
    }).compile();

    service = module.get<GameChatService>(GameChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
