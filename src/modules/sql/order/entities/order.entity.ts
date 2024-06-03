import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import sequelize, { DataTypes, Op, col } from 'sequelize';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Index,
  Table,
} from 'sequelize-typescript';
import { getUTCDateNow, zeroPad } from 'src/core/core.utils';
import { Cart } from '../../cart/entities/cart.entity';
import { OrderAddress } from '../../order-address/entities/order-address.entity';
import { OrderItem } from '../../order-item/entities/order-item.entity';
import { OrderPayment } from '../../order-payment/entities/order-payment.entity';
import { PaymentStatus } from '../../order-payment/payment-status.enum';
import { OrderStatusLog } from '../../order-status-log/entities/order-status-log.entity';
import { User } from '../../user/entities/user.entity';
import { OrderStatus } from '../order-status.enum';

@Table
export class Order extends SqlModel {
  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Order ID',
    example: 'OPUS-051624000001',
    readOnly: true,
  })
  uid: string;

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

  @ForeignKey(() => Cart)
  @Column
  @Index
  @ApiProperty({
    description: 'Cart Id',
    example: 1,
  })
  @IsNumber()
  cart_id: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Sub Total Amount',
    example: 32.04,
  })
  @IsNumber()
  sub_total: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Sub Total Amount',
    example: 32.04,
  })
  @IsNumber()
  shipping_price: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Sub Total Amount',
    example: 32.04,
  })
  @IsNumber()
  tax: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Sub Total Amount',
    example: 32.04,
  })
  @IsNumber()
  total: number;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    enum: { Y: 'Y', N: 'N' },
    description: 'Y | N',
    example: 'Y',
  })
  @IsOptional()
  @IsEnum({ Y: 'Y', N: 'N' })
  is_repeating_order?: string;

  @Column
  @ApiProperty({
    description: 'Repeating days',
    example: 15,
  })
  @ValidateIf((object) => object.is_repeating_order === 'Y')
  @IsNumber()
  repeating_days?: number;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    enum: { Y: 'Y', N: 'N' },
    description: 'Y | N',
    example: 'Y',
    readOnly: true,
  })
  @IsOptional()
  @IsEnum({ Y: 'Y', N: 'N' })
  is_base_order?: string;

  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Parent Order Id',
    example: 1,
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  parent_order_id?: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PaymentPending,
  })
  @ApiProperty({
    enum: OrderStatus,
    description: 'OrderStatus',
    example: OrderStatus.Ordered,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Include({
    attributes: [
      'id',
      'order_id',
      'billing_address_id',
      'billing_first_name',
      'billing_last_name',
      'billing_name',
      'billing_email',
      'billing_phone_code',
      'billing_phone',
      'billing_address',
      'billing_city',
      'billing_state',
      'billing_zip_code',
      'shipping_first_name',
      'shipping_last_name',
      'shipping_name',
      'shipping_email',
      'shipping_phone_code',
      'shipping_phone',
      'shipping_address',
      'shipping_city',
      'shipping_state',
      'shipping_zip_code',
    ],
  })
  @HasOne(() => OrderAddress)
  address: OrderAddress;

  @Include({
    attributes: ['id', 'order_id', 'product_id', 'quantity', 'price'],
  })
  @HasMany(() => OrderItem)
  items: OrderItem[];

  @Include({
    attributes: [
      'id',
      'order_id',
      'type',
      'payment_link',
      'payment_link_url',
      'status',
    ],
  })
  @HasMany(() => OrderPayment)
  payments: OrderPayment[];

  @Include({
    attributes: [
      'id',
      'order_id',
      'type',
      'payment_link',
      'payment_link_url',
      'status',
    ],
    where: { status: PaymentStatus.Pending },
  })
  @HasOne(() => OrderPayment)
  current_payment: OrderPayment;

  @Include({
    attributes: ['id', 'order_id', 'status', 'created_at'],
  })
  @HasMany(() => OrderStatusLog)
  status_logs: OrderStatusLog[];

  @Include({
    attributes: ['id', 'order_id', 'status', 'created_at'],
    where: {
      status: { [Op.eq]: col('Order.status') },
    },
  })
  @HasOne(() => OrderStatusLog)
  current_status: OrderStatusLog;

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

  @BeforeCreate
  static async setSlug(instance: Order) {
    const o = await Order.findOne({
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
      instance.uid = `OPUS-${getUTCDateNow('MMDDYY')}${zeroPad('1', 6)}`;
    } else {
      instance.uid = `OPUS-${getUTCDateNow('MMDDYY')}${zeroPad((Number(o.uid.substring(11)) + 1).toString(), 6)}`;
    }
  }
}
