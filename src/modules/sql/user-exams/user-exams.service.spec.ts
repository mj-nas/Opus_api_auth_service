import { Test, TestingModule } from '@nestjs/testing';
import { UserExamsService } from './user-exams.service';

describe('UserExamsService', () => {
  let service: UserExamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserExamsService],
    }).compile();

    service = module.get<UserExamsService>(UserExamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
