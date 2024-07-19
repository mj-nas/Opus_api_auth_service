import { Test, TestingModule } from '@nestjs/testing';
import { ExamModuleService } from './exam-module.service';

describe('ExamModuleService', () => {
  let service: ExamModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamModuleService],
    }).compile();

    service = module.get<ExamModuleService>(ExamModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
