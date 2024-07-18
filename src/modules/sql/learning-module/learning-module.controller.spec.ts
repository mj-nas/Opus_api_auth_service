import { Test, TestingModule } from '@nestjs/testing';
import { LearningModuleController } from './learning-module.controller';
import { LearningModuleService } from './learning-module.service';

describe('LearningModuleController', () => {
  let controller: LearningModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningModuleController],
      providers: [LearningModuleService],
    }).compile();

    controller = module.get<LearningModuleController>(LearningModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
