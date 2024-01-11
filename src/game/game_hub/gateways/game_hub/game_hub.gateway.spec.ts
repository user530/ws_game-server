import { Test, TestingModule } from '@nestjs/testing';
import { GameHubGateway } from './game_hub.gateway';

describe('GameHubGateway', () => {
  let gateway: GameHubGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameHubGateway],
    }).compile();

    gateway = module.get<GameHubGateway>(GameHubGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
