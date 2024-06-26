import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
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
    MsClientModule,
    ConfigModule,
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
