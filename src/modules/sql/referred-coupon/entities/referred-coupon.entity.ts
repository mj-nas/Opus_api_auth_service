import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Column, ForeignKey, Index, Table } from 'sequelize-typescript';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { Referral } from '../../referral/entities/referral.entity';

@Table
export class ReferredCoupons extends SqlModel {
  @ForeignKey(() => Referral)
  @Column
  @Index
  @ApiProperty({
    description: 'Referral Id',
    example: 1,
  })
  @IsNumber()
  referral_id: number;

  @ForeignKey(() => Coupon)
  @Column
  @Index
  @ApiProperty({
    description: 'Coupon Id',
    example: 1,
  })
  @IsNumber()
  coupon_id: number;
}
