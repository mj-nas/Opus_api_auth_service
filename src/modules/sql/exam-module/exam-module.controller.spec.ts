import { Test, TestingModule } from '@nestjs/testing';
import { ExamModuleController } from './exam-module.controller';
import { ExamModuleService } from './exam-module.service';

describe('ExamModuleController', () => {
  let controller: ExamModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamModuleController],
      providers: [ExamModuleService],
    }).compile();

    controller = module.get<ExamModuleController>(ExamModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
