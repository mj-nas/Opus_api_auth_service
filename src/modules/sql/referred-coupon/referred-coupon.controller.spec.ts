import { Test, TestingModule } from '@nestjs/testing';
import { ReferredCouponController } from './referred-coupon.controller';
import { ReferredCouponService } from './referred-coupon.service';

describe('ReferredCouponController', () => {
  let controller: ReferredCouponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferredCouponController],
      providers: [ReferredCouponService],
    }).compile();

    controller = module.get<ReferredCouponController>(ReferredCouponController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
