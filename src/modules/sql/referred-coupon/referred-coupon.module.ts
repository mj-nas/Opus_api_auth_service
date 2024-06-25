import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferredCoupons } from './entities/referred-coupon.entity';
import { ReferredCouponController } from './referred-coupon.controller';
import { ReferredCouponService } from './referred-coupon.service';

@Module({
  imports: [SqlModule.register(ReferredCoupons)],
  controllers: [ReferredCouponController],
  providers: [ReferredCouponService],
  exports: [ReferredCouponService],
})
export class ReferredCouponModule {}
