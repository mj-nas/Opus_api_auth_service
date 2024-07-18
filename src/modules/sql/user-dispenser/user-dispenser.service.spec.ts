import { Test, TestingModule } from '@nestjs/testing';
import { UserDispenserService } from './user-dispenser.service';

describe('UserDispenserService', () => {
  let service: UserDispenserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDispenserService],
    }).compile();

    service = module.get<UserDispenserService>(UserDispenserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
