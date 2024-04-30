import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  let service: RecentlyViewedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecentlyViewedService],
    }).compile();

    service = module.get<RecentlyViewedService>(RecentlyViewedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
