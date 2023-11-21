import { Test, TestingModule } from '@nestjs/testing';
import { GameInstanceGateway } from './game_instance.gateway';

describe('GameInstanceGateway', () => {
  let gateway: GameInstanceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameInstanceGateway],
    }).compile();

    gateway = module.get<GameInstanceGateway>(GameInstanceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
