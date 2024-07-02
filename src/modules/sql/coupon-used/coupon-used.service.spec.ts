import { Test, TestingModule } from '@nestjs/testing';
import { CouponUsedService } from './coupon-used.service';

describe('CouponUsedService', () => {
  let service: CouponUsedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponUsedService],
    }).compile();

    service = module.get<CouponUsedService>(CouponUsedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
