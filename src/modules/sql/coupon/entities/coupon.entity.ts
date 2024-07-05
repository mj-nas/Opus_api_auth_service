import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, ValidateIf } from 'class-validator';

import { Include } from '@core/sql/sql.decorator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { CouponUsed } from '../../coupon-used/entities/coupon-used.entity';
import { User } from '../../user/entities/user.entity';
import { CouponOwner } from '../coupon-owner.enum';

@Table
export class Coupon extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Coupon name',
    example: 'United States',
    type: String,
  })
  @IsString()
  name: string;

  @Column({ unique: true })
  @Index
  @ApiProperty({
    description: 'Coupon code',
    example: 'US',
    type: String,
  })
  @IsString()
  code: string;

  @Column({
    type: DataType.ENUM(...Object.values(CouponOwner)),
    defaultValue: CouponOwner.Admin,
  })
  @ApiProperty({
    enum: CouponOwner,
    description: 'Coupon Type',
    example: CouponOwner.Dispenser,
  })
  @IsEnum(CouponOwner)
  owner?: CouponOwner;

  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @ValidateIf((object) => object.type === CouponOwner.Dispenser)
  @IsNumber()
  user_id?: number;

  @Column
  @ApiProperty({
    description: 'Coupon discount percentage',
    example: '32.04',
    type: Number,
  })
  @IsNumber()
  discount: string;

  @Column
  @ApiProperty({
    description: 'Discount usage limit',
    example: 30,
    type: Number,
  })
  @IsNumber()
  discount_usage: number;

  @Column
  @ApiProperty({
    description: 'Coupon valid from date',
    example: '2021-01-01',
    type: Date,
  })
  @IsString()
  valid_from: string;

  @Column
  @ApiProperty({
    description: 'Coupon valid to date',
    example: '2021-01-01',
    type: Date,
  })
  @IsString()
  valid_to: string;

  @Column({ type: DataType.ENUM('price', 'percentage') })
  @ApiProperty({
    description: 'Coupon type',
    example: 'percentage',
    enum: ['price', 'percentage'],
  })
  @IsString()
  coupon_type: string;

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
    ],
  })
  @BelongsTo(() => User)
  user: User;

  @Include({
    attributes: ['user_id', 'coupon_id'],
  })
  @HasMany(() => CouponUsed)
  coupon_used_me: CouponUsed;

  @Include({
    attributes: ['user_id', 'coupon_id'],
  })
  @HasMany(() => CouponUsed)
  coupon_used: CouponUsed;
}
