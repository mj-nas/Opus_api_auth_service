import { Test, TestingModule } from '@nestjs/testing';
import { ExamQuestionSetService } from './exam-question-set.service';

describe('ExamQuestionSetService', () => {
  let service: ExamQuestionSetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamQuestionSetService],
    }).compile();

    service = module.get<ExamQuestionSetService>(ExamQuestionSetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
