/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { Products } from '../../products/entities/products.entity';

@Table
export class ProductGallery extends SqlModel {
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
    description: 'Product Image',
    example: 'http://image',
  })
  @IsString()
  product_image: string;

  @Column({ type: DataType.ENUM('Y', 'N'),defaultValue: 'N' })
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_primary: string;

  @BelongsTo(() => Products)
  products: Products;

}
