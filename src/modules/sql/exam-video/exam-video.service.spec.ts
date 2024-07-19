import { Test, TestingModule } from '@nestjs/testing';
import { ExamVideoService } from './exam-video.service';

describe('ExamVideoService', () => {
  let service: ExamVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamVideoService],
    }).compile();

    service = module.get<ExamVideoService>(ExamVideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
