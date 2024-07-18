import { Test, TestingModule } from '@nestjs/testing';
import { LearningModuleService } from './learning-module.service';

describe('LearningModuleService', () => {
  let service: LearningModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningModuleService],
    }).compile();

    service = module.get<LearningModuleService>(LearningModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
