import { Test, TestingModule } from '@nestjs/testing';
import { GameHubEventsService } from './game_hub_events.service';

describe('GameHubEventsService', () => {
  let service: GameHubEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameHubEventsService],
    }).compile();

    service = module.get<GameHubEventsService>(GameHubEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
