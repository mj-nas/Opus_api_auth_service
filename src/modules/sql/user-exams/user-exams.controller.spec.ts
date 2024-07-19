import { Test, TestingModule } from '@nestjs/testing';
import { UserExamsController } from './user-exams.controller';
import { UserExamsService } from './user-exams.service';

describe('UserExamsController', () => {
  let controller: UserExamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserExamsController],
      providers: [UserExamsService],
    }).compile();

    controller = module.get<UserExamsController>(UserExamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
