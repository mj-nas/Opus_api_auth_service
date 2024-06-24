import { OmitType } from '@nestjs/swagger';
import { ReferredCoupon } from '../entities/referred-coupon.entity';

export class CreateReferredCouponDto extends OmitType(ReferredCoupon, ['active'] as const) {}
