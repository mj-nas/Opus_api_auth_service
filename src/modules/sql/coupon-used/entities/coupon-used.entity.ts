import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { User } from '../../user/entities/user.entity';

@Table
export class CouponUsed extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
    readOnly: true,
  })
  @IsNumber()
  user_id: number;

  @ForeignKey(() => Coupon)
  @Column
  @Index
  @ApiProperty({
    description: 'Coupon ID',
    example: 1,
  })
  @IsNumber()
  coupon_id?: number;

  @Include({
    attributes: [
      'id',
      'slug',
      'role',
      'uid',
      'first_name',
      'last_name',
      'name',
      'email',
      'phone_code',
      'phone',
      'avatar',
      'dispenser_id',
      'connection_via',
    ],
  })
  @BelongsTo(() => User)
  user: User;

  @Include({
    attributes: ['id', 'name', 'code', 'discount', 'coupon_type'],
    required: false,
  })
  @BelongsTo(() => Coupon)
  coupon: Coupon;
}
