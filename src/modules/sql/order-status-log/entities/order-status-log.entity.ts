import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import {
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';
import { OrderStatus } from '../../order/order-status.enum';

@Table
export class OrderStatusLog extends SqlModel {
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
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PaymentPending,
  })
  @ApiProperty({
    enum: OrderStatus,
    description: 'OrderStatus',
    example: OrderStatus.PaymentPending,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
