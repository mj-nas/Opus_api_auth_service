import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { CouponUsedController } from './coupon-used.controller';
import { CouponUsedService } from './coupon-used.service';
import { CouponUsed } from './entities/coupon-used.entity';

@Module({
  imports: [SqlModule.register(CouponUsed)],
  controllers: [CouponUsedController],
  providers: [CouponUsedService],
  exports: [CouponUsedService],
})
export class CouponUsedModule {}
