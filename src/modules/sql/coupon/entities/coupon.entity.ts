import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
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
    example: 'This coupon offers a discount for purchases in the United States.',
    type: String,
  })
  @IsString()
  description: string;

  @Column(DataType.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Coupon discount percentage',
    example: 32.04,
    type: Number,
  })
  @IsNumber()
  discount_percentage: number;

  @Column
  @ApiProperty({
    description: 'Discount usage limit',
    example: 30,
    type: Number,
  })
  @IsNumber()
  discount_usage: number;

  @Column(DataTypes.DATE)
  @ApiProperty({
    description: 'Coupon valid from date',
    example: '2024-03-01T00:00:00.000Z', 
    type: String,
  })
  @IsDate()
  valid_from: Date;

  @Column(DataTypes.DATE)
  @ApiProperty({
    description: 'Coupon valid to date',
    example: '2024-03-31T23:59:59.999Z',
    type: String,
  })
  @IsDate()
  valid_to: Date;

  @Column({ type: DataType.ENUM('price', 'percentage') })
  @ApiProperty({
    description: 'Coupon type',
    example: 'percentage',
    enum: ['price', 'percentage'],
  })
  @IsString()
  coupon_type: string;
}
