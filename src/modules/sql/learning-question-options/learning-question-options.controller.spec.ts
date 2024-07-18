import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionOptionsController } from './learning-question-options.controller';
import { LearningQuestionOptionsService } from './learning-question-options.service';

describe('LearningQuestionOptionsController', () => {
  let controller: LearningQuestionOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningQuestionOptionsController],
      providers: [LearningQuestionOptionsService],
    }).compile();

    controller = module.get<LearningQuestionOptionsController>(LearningQuestionOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
