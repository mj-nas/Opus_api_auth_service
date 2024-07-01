import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import sequelize, { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  BeforeSave,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { getUTCDateNow, zeroPad } from 'src/core/core.utils';
import { Order } from '../../order/entities/order.entity';
import { CommissionStatus } from '../commission-status.enum';

@Table
export class Commission extends SqlModel {
  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Order ID',
    example: 'OPUS-051624000001',
    readOnly: true,
  })
  uid: string;

  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Order Id',
    example: 1,
  })
  @IsNumber()
  order_id: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Order Amount',
    example: 32.04,
  })
  @IsNumber()
  order_amount: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Coupon Discount Amount',
    example: 32.04,
  })
  @IsNumber()
  coupon_discount_amount: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Internal fee like shipping minus amount',
    example: 10,
  })
  @IsNumber()
  internal_fee: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Commission Percentage',
    example: 10,
  })
  @IsNumber()
  commission_percentage: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Commission',
    example: 10,
    readOnly: true,
  })
  @IsNumber()
  commission: number;

  @Column({
    type: DataType.ENUM(...Object.values(CommissionStatus)),
    defaultValue: CommissionStatus.Pending,
  })
  @ApiProperty({
    enum: CommissionStatus,
    description: 'CommissionStatus',
    example: CommissionStatus.Paid,
  })
  @IsEnum(CommissionStatus)
  status: CommissionStatus;

  @BelongsTo(() => Order)
  order: Order;

  @BeforeCreate
  static async setSlug(instance: Commission): Promise<void> {
    const o = await Commission.findOne({
      attributes: ['uid'],
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('created_at')),
        '=',
        sequelize.fn('DATE', sequelize.fn('NOW')),
      ),
      paranoid: false,
      order: [['id', 'DESC']],
    });

    if (!o?.uid) {
      instance.uid = `COMM-${getUTCDateNow('MMDDYY')}${zeroPad('1', 6)}`;
    } else {
      instance.uid = `COMM-${getUTCDateNow('MMDDYY')}${zeroPad((Number(o.uid.substring(11)) + 1).toString(), 6)}`;
    }
  }

  @BeforeSave
  static setName(instance: Commission) {
    const order_amount = instance.order_amount || 0;
    const coupon_discount_amount = instance.coupon_discount_amount || 0;
    const internal_fee = instance.internal_fee || 0;
    const commission_percentage = instance.commission_percentage || 0;
    if (order_amount > 0 && commission_percentage > 0) {
      const total = order_amount - coupon_discount_amount - internal_fee;
      if (total > 0) {
        instance.commission =
          Math.floor(total * (commission_percentage / 100) * 100) / 100;
      }
    }
  }
}
