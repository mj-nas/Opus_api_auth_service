import { Test, TestingModule } from '@nestjs/testing';
import { UserDispenserController } from './user-dispenser.controller';
import { UserDispenserService } from './user-dispenser.service';

describe('UserDispenserController', () => {
  let controller: UserDispenserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDispenserController],
      providers: [UserDispenserService],
    }).compile();

    controller = module.get<UserDispenserController>(UserDispenserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
