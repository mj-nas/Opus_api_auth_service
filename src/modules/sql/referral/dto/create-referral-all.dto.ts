import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { CreateReferredCouponDto } from '../../referred-coupon/dto/create-referred-coupon.dto';
import { CreateReferredProductsDto } from '../../referred-products/dto/create-referred-products.dto';
import { Referral } from '../entities/referral.entity';

export class CreateReferralAllDto extends OmitType(Referral, [
  'active',
] as const) {
  @ApiProperty({
    format: 'array',
    description: 'referred_products',
    example: [
      {
        id: 1,
        name: 'product1',
        product_image: '',
      },
    ],
  })
  @IsArray()
  referred_products: CreateReferredProductsDto[];

  @ApiProperty({
    format: 'array',
    description: 'referred_coupons',
    example: [
      {
        id: 1,
        code: 'US',
      },
    ],
  })
  @IsArray()
  referred_coupons: CreateReferredCouponDto[];
}
