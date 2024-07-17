import { Test, TestingModule } from '@nestjs/testing';
import { LearningVideoService } from './learning-video.service';

describe('LearningVideoService', () => {
  let service: LearningVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningVideoService],
    }).compile();

    service = module.get<LearningVideoService>(LearningVideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
