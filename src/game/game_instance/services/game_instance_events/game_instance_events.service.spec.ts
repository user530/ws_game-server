import { Test, TestingModule } from '@nestjs/testing';
import { GameInstanceEventsService } from './game_instance_events.service';

describe('GameInstanceEventsService', () => {
  let service: GameInstanceEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameInstanceEventsService],
    }).compile();

    service = module.get<GameInstanceEventsService>(GameInstanceEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
