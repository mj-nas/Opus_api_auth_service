import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Cart } from '../../cart/entities/cart.entity';
import { Products } from '../../products/entities/products.entity';

@Table
export class CartItem extends SqlModel {
  @ForeignKey(() => Cart)
  @Column
  @Index
  @ApiProperty({
    description: 'Cart Id',
    example: 1,
  })
  @IsNumber()
  cart_id: number;

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

  @BelongsTo(() => Cart)
  cart: Cart;

  // @Include({
  //   required: true,
  // })
  @BelongsTo(() => Products)
  product: Products;
}
