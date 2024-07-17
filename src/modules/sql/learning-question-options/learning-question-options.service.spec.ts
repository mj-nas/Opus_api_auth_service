import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionOptionsService } from './learning-question-options.service';

describe('LearningQuestionOptionsService', () => {
  let service: LearningQuestionOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningQuestionOptionsService],
    }).compile();

    service = module.get<LearningQuestionOptionsService>(LearningQuestionOptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
