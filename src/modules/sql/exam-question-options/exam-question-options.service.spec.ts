import { Test, TestingModule } from '@nestjs/testing';
import { ExamQuestionOptionsService } from './exam-question-options.service';

describe('ExamQuestionOptionsService', () => {
  let service: ExamQuestionOptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamQuestionOptionsService],
    }).compile();

    service = module.get<ExamQuestionOptionsService>(ExamQuestionOptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
