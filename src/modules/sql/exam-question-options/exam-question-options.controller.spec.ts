import { Test, TestingModule } from '@nestjs/testing';
import { ExamQuestionOptionsController } from './exam-question-options.controller';
import { ExamQuestionOptionsService } from './exam-question-options.service';

describe('ExamQuestionOptionsController', () => {
  let controller: ExamQuestionOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamQuestionOptionsController],
      providers: [ExamQuestionOptionsService],
    }).compile();

    controller = module.get<ExamQuestionOptionsController>(ExamQuestionOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
