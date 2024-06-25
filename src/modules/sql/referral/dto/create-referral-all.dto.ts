import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString } from 'class-validator';
import { CreateReferredCouponDto } from '../../referred-coupon/dto/create-referred-coupon.dto';
import { CreateReferredProductsDto } from '../../referred-products/dto/create-referred-products.dto';

export class CreateReferralAllDto {
  @ApiProperty({
    description: 'Email',
    example: 'ross.geller@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

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
