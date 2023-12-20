import { Test, TestingModule } from '@nestjs/testing';
import { GameEmitterService } from './game_emitter.service';

describe('GameEmitterService', () => {
  let service: GameEmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameEmitterService],
    }).compile();

    service = module.get<GameEmitterService>(GameEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
