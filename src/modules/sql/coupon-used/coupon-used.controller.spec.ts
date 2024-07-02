import { Test, TestingModule } from '@nestjs/testing';
import { CouponUsedController } from './coupon-used.controller';
import { CouponUsedService } from './coupon-used.service';

describe('CouponUsedController', () => {
  let controller: CouponUsedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponUsedController],
      providers: [CouponUsedService],
    }).compile();

    controller = module.get<CouponUsedController>(CouponUsedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
