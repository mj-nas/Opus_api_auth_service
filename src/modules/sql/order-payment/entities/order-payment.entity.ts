import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';
import { PaymentStatus } from '../payment-status.enum';
import { PaymentType } from '../payment-type.enum';

@Table
export class OrderPayment extends SqlModel {
  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Order Id',
    example: 1,
  })
  @IsNumber()
  order_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentType)),
    defaultValue: PaymentType.Stripe,
  })
  @ApiProperty({
    enum: PaymentType,
    description: 'PaymentType',
    example: PaymentType.Stripe,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @Column
  @ApiProperty({
    description: 'Payment Link ID',
    example: 'plink_1PITSMSJ73v1BbAU78op8VXN',
  })
  @IsString()
  payment_link: string;

  @Column
  @ApiProperty({
    description: 'Payment URL',
    example: 'https://buy.stripe.com/test_fZe8y1gPn66q8AUbIK',
  })
  @IsString()
  payment_link_url: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.Pending,
  })
  @ApiProperty({
    enum: PaymentStatus,
    description: 'PaymentStatus',
    example: PaymentStatus.Completed,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @BelongsTo(() => Order)
  order: Order;
}
