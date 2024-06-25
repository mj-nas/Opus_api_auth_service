import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferredCouponModule } from '../referred-coupon/referred-coupon.module';
import { ReferredProductsModule } from '../referred-products/referred-products.module';
import { Referral } from './entities/referral.entity';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';

@Module({
  imports: [
    SqlModule.register(Referral),
    ReferredCouponModule,
    ReferredProductsModule,
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
