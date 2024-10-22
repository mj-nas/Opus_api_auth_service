import { Test, TestingModule } from '@nestjs/testing';
import { CmsHomeController } from './cms-home.controller';
import { CmsHomeService } from './cms-home.service';

describe('CmsHomeController', () => {
  let controller: CmsHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsHomeController],
      providers: [CmsHomeService],
    }).compile();

    controller = module.get<CmsHomeController>(CmsHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
