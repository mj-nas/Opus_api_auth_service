import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BelongsTo, Column, ForeignKey, Table } from 'sequelize-typescript';
import { Products } from '../../products/entities/products.entity';
import { User } from '../../user/entities/user.entity';

@Table
export class Wishlist extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @ApiProperty({
    description: 'User ID',
    example: 1,
    readOnly: true,
  })
  @IsNumber()
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Products)
  @Column
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;
}
