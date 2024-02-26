/* eslint-disable prettier/prettier */
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
import config from 'src/config';
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
  @ApiProperty({
    description: 'product image',
    example: 'product_image.png',
  })
  @IsString()
  get product_image(): string {
    return this.getDataValue('product_image')
      ? config().cdnURL + this.getDataValue('product_image')
      : null;
  }

  set product_image(v: string) {
    this.setDataValue(
      'product_image',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'N' })
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_primary: string;

  @BelongsTo(() => Products)
  products: Products;
}
