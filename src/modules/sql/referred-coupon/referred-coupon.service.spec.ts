import { Test, TestingModule } from '@nestjs/testing';
import { ReferredCouponService } from './referred-coupon.service';

describe('ReferredCouponService', () => {
  let service: ReferredCouponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferredCouponService],
    }).compile();

    service = module.get<ReferredCouponService>(ReferredCouponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
