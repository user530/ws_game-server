import { Test, TestingModule } from '@nestjs/testing';
import { HubLogicService } from './hub_logic.service';

describe('HubLogicService', () => {
  let service: HubLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HubLogicService],
    }).compile();

    service = module.get<HubLogicService>(HubLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
