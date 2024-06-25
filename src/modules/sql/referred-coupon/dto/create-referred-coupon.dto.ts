import { OmitType } from '@nestjs/swagger';
import { ReferredCoupons } from '../entities/referred-coupon.entity';

export class CreateReferredCouponDto extends OmitType(ReferredCoupons, [
  'active',
] as const) {}
