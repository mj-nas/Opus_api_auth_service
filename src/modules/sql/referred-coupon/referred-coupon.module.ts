import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferredCouponController } from './referred-coupon.controller';
import { ReferredCouponService } from './referred-coupon.service';
import { ReferredCoupon } from './entities/referred-coupon.entity';

@Module({
  imports: [SqlModule.register(ReferredCoupon)],
  controllers: [ReferredCouponController],
  providers: [ReferredCouponService],
})
export class ReferredCouponModule {}
