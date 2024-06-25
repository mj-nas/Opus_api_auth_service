import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateReferredCouponDto {
  @ApiProperty({
    format: 'uint32',
    description: 'coupon_id',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    format: 'string',
    description: 'code',
    example: 'US',
  })
  code: string;
}
