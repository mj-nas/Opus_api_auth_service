import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Index,
  Table,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';
import { ProductReview } from '../../product-review/entities/product-review.entity';
import { Products } from '../../products/entities/products.entity';

export enum OrderItemStatus {
  Ordered = 'Ordered',
  Delivered = 'Delivered',
  Returned = 'Returned',
}

@Table
export class OrderItem extends SqlModel {
  @ForeignKey(() => Order)
  @Column
  @Index
  @ApiProperty({
    description: 'Order Id',
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

  @Column({
    type: DataType.ENUM(...Object.values(OrderItemStatus)),
    defaultValue: OrderItemStatus.Ordered,
  })
  @ApiProperty({
    enum: OrderItemStatus,
    description: 'OrderStatus',
    example: OrderItemStatus.Ordered,
  })
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;

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
  price_per_item: number;

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

  @Include({
    attributes: [
      'id',
      'order_id',
      'product_id',
      'order_item_id',
      'rating',
      'review',
      'created_at',
    ],
  })
  @HasOne(() => ProductReview)
  item_review: ProductReview;
}
