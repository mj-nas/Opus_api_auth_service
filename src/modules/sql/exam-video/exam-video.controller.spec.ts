import { Test, TestingModule } from '@nestjs/testing';
import { ExamVideoController } from './exam-video.controller';
import { ExamVideoService } from './exam-video.service';

describe('ExamVideoController', () => {
  let controller: ExamVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamVideoController],
      providers: [ExamVideoService],
    }).compile();

    controller = module.get<ExamVideoController>(ExamVideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
