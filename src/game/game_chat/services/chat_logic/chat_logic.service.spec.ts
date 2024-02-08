import { Test, TestingModule } from '@nestjs/testing';
import { ChatLogicService } from './chat_logic.service';

describe('ChatLogicService', () => {
  let service: ChatLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatLogicService],
    }).compile();

    service = module.get<ChatLogicService>(ChatLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
