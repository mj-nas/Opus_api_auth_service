import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { OrderItem } from '../../order-item/entities/order-item.entity';
import { Order } from '../../order/entities/order.entity';
import { Products } from '../../products/entities/products.entity';
import { User } from '../../user/entities/user.entity';
import { ReviewStatus } from '../product-review-status.enum';

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

  @ForeignKey(() => OrderItem)
  @Column
  @Index
  @ApiProperty({
    description: 'Order Item Id',
    example: 1,
  })
  @IsNumber()
  order_item_id: number;

  @Column
  @ApiProperty({
    description: 'Rating',
    example: 1,
  })
  @IsNumber()
  rating: number;

  @Column({
    type: DataType.ENUM(...Object.values(ReviewStatus)),
    defaultValue: ReviewStatus.Approved,
  })
  @ApiProperty({
    enum: ReviewStatus,
    description: 'Status',
    example: ReviewStatus.Approved,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @Column({
    type: DataType.STRING(2000),
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

  @Include({
    paranoid: false,
  })
  @BelongsTo(() => Products)
  product: Products;

  @BelongsTo(() => User, 'created_by')
  user: User;
}
