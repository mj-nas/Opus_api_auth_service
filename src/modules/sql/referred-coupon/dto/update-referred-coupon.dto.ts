import { OmitType, PartialType } from '@nestjs/swagger';
import { ReferredCoupons } from '../entities/referred-coupon.entity';

export class UpdateReferredCouponDto extends PartialType(
  OmitType(ReferredCoupons, [] as const),
) {}
