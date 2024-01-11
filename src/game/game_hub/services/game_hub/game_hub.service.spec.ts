import { Test, TestingModule } from '@nestjs/testing';
import { GameHubService } from './game_hub.service';

describe('GameHubService', () => {
  let service: GameHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameHubService],
    }).compile();

    service = module.get<GameHubService>(GameHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
