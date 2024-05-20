import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';
import { Products } from '../../products/entities/products.entity';

@Table
export class OrderItem extends SqlModel {
  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Cart Id',
    example: 1,
  })
  @IsNumber()
  order_id: number;

  @ForeignKey(() => Products)
  @Column
  @Index
  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  product_id: number;

  @Column
  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  @IsNumber()
  quantity: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Price',
    example: 32.04,
  })
  @IsNumber()
  price: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Products)
  product: Products;
}
