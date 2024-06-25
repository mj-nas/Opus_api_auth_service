import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Column, ForeignKey, Index, Table } from 'sequelize-typescript';
import { Products } from '../../products/entities/products.entity';
import { Referral } from '../../referral/entities/referral.entity';

@Table
export class ReferredProducts extends SqlModel {
  @ForeignKey(() => Referral)
  @Column
  @Index
  @ApiProperty({
    description: 'Referral Id',
    example: 1,
  })
  @IsNumber()
  referral_id: number;

  @ForeignKey(() => Products)
  @Column
  @Index
  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  product_id: number;
}
