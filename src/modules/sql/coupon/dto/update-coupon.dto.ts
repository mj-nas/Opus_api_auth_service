import { OmitType, PartialType } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';

export class UpdateCouponDto extends PartialType(
  OmitType(Coupon, [] as const),
) {}
