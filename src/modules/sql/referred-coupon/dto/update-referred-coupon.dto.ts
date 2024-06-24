import { OmitType, PartialType } from '@nestjs/swagger';
import { ReferredCoupon } from '../entities/referred-coupon.entity';

export class UpdateReferredCouponDto extends PartialType(
  OmitType(ReferredCoupon, [] as const),
) {}
