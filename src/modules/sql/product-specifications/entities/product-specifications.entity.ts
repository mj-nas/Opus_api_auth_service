import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { Products } from '../../products/entities/products.entity';

@Table
export class ProductSpecifications extends SqlModel {
  @ForeignKey(() => Products)
  @Column
  @Index
  @ApiProperty({
    description: 'Product id',
    example: 1,
  })
  @IsString()
  product_id: number;

  @Column
  @Index
  @ApiProperty({
    description: 'specification',
    example: 'specification',
  })
  @IsString()
  specification: string;

  @Column({
    type: DataType.STRING(500),
  })
  @Index
  @ApiProperty({
    description: 'specification',
    example: 'specification',
  })
  @IsString()
  specification_details: string;

  @Include({
    paranoid: false,
  })
  @BelongsTo(() => Products)
  products: Products;
}
