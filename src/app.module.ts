import { EmailModule } from '@core/email';
import { MongoModule } from '@core/mongo';
import { SqlModule } from '@core/sql';
import { StripeModule } from '@core/stripe';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CommonModule } from './modules/common.module';
import { ReferralModule } from './modules/sql/referral/referral.module';
import { ReferredProductsModule } from './modules/sql/referred-products/referred-products.module';
import { ReferredCouponModule } from './modules/sql/referred-coupon/referred-coupon.module';

@Module({
  imports: [
    CoreModule,
    MongoModule.root({ seeder: true }),
    SqlModule.root({ seeder: true }),
    EmailModule,
    StripeModule,
    CommonModule.register(),
    ReferralModule,
    ReferredProductsModule,
    ReferredCouponModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
