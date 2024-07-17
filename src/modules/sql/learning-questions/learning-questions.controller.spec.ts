import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionsController } from './learning-questions.controller';
import { LearningQuestionsService } from './learning-questions.service';

describe('LearningQuestionsController', () => {
  let controller: LearningQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningQuestionsController],
      providers: [LearningQuestionsService],
    }).compile();

    controller = module.get<LearningQuestionsController>(LearningQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
