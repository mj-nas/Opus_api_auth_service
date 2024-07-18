import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionsService } from './learning-questions.service';

describe('LearningQuestionsService', () => {
  let service: LearningQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningQuestionsService],
    }).compile();

    service = module.get<LearningQuestionsService>(LearningQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
