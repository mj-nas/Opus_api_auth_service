import { Test, TestingModule } from '@nestjs/testing';
import { LearningQuestionSetController } from './learning-question-set.controller';
import { LearningQuestionSetService } from './learning-question-set.service';

describe('LearningQuestionSetController', () => {
  let controller: LearningQuestionSetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningQuestionSetController],
      providers: [LearningQuestionSetService],
    }).compile();

    controller = module.get<LearningQuestionSetController>(LearningQuestionSetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
