import { GameInstanceGuard } from './game_instance.guard';

describe('GameInstanceGuard', () => {
  it('should be defined', () => {
    expect(new GameInstanceGuard()).toBeDefined();
  });
});
