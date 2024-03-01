import { OmitType } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';

export class CreateCouponDto extends OmitType(Coupon, ['active'] as const) {}
