import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Column, DataType, Index, Table } from 'sequelize-typescript';

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

  @Column
  @Index
  @ApiProperty({
    description: 'Coupon code',
    example: 'US',
    type: String,
  })
  @IsString()
  code: string;

  @Column({
    type: DataType.STRING(500),
  })
  @Index
  @ApiProperty({
    description: 'Coupon description',
    example:
      'This coupon offers a discount for purchases in the United States.',
    type: String,
  })
  @IsString()
  description: string;

  @Column(DataType.Decimal)
  @ApiProperty({
    description: 'Coupon discount percentage',
    example: 32.04,
    type: Number,
  })
  @IsNumber()
  discount: number;

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
}
