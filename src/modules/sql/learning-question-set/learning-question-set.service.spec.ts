import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionSetService } from './learning-question-set.service';

describe('LearningQuestionSetService', () => {
  let service: LearningQuestionSetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningQuestionSetService],
    }).compile();

    service = module.get<LearningQuestionSetService>(LearningQuestionSetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
