import { Test, TestingModule } from '@nestjs/testing';
import { LearningVideoController } from './learning-video.controller';
import { LearningVideoService } from './learning-video.service';

describe('LearningVideoController', () => {
  let controller: LearningVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningVideoController],
      providers: [LearningVideoService],
    }).compile();

    controller = module.get<LearningVideoController>(LearningVideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
