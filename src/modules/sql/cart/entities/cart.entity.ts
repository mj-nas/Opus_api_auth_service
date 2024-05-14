import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import {
  Column,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { CartItem } from '../../cart-item/entities/cart-item.entity';
import { User } from '../../user/entities/user.entity';

@Table
export class Cart extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @IsNumber()
  user_id: number;

  @HasMany(() => CartItem)
  items: CartItem[];
}
