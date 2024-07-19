import { Test, TestingModule } from '@nestjs/testing';
import { ExamQuestionSetController } from './exam-question-set.controller';
import { ExamQuestionSetService } from './exam-question-set.service';

describe('ExamQuestionSetController', () => {
  let controller: ExamQuestionSetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamQuestionSetController],
      providers: [ExamQuestionSetService],
    }).compile();

    controller = module.get<ExamQuestionSetController>(ExamQuestionSetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
