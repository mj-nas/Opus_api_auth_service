import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';
import { Products } from '../../products/entities/products.entity';
import { User } from '../../user/entities/user.entity';

@Table
export class ProductReview extends SqlModel {
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

  @Column
  @ApiProperty({
    description: 'Rating',
    example: 1,
  })
  @IsNumber()
  rating: number;

  @Column({
    type: DataType.STRING(500),
  })
  @ApiProperty({
    description: 'Review',
    example: 1,
  })
  @IsOptional()
  @IsString()
  review?: string;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Products)
  product: Products;

  @BelongsTo(() => User, 'created_by')
  user: User;
}
