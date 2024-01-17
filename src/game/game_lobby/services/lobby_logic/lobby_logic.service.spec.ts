import { Test, TestingModule } from '@nestjs/testing';
import { LobbyLogicService } from './lobby_logic.service';

describe('LobbyLogicService', () => {
  let service: LobbyLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LobbyLogicService],
    }).compile();

    service = module.get<LobbyLogicService>(LobbyLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
