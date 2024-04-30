import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyViewedController } from './recently-viewed.controller';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedController', () => {
  let controller: RecentlyViewedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentlyViewedController],
      providers: [RecentlyViewedService],
    }).compile();

    controller = module.get<RecentlyViewedController>(RecentlyViewedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
