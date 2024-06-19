import { PickType } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';

export class CreateCouponDto extends PickType(Coupon, [
  'name',
  'code',
  'owner',
  'user_id',
  'discount',
  'discount_usage',
  'valid_from',
  'valid_to',
  'coupon_type',
] as const) {}
