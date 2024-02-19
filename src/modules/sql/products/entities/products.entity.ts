/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  Table,
  Column,
  Index,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { ProductCategory } from '../../product-category/entities/product-category.entity';

@Table
export class Products extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Products name',
    example: 'product name',
  })
  @IsString()
  product_name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Products Description',
    example: 'product description',
  })
  @IsString()
  product_description: string;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @Index
  @ApiProperty({
    description: 'Products Description',
    example: 32.04,
  })
  product_price: number;

  @ForeignKey(() => ProductCategory)
  @Column
  @Index
  @ApiProperty({
    description: 'Products category',
    example: 'product category',
  })
  @IsString()
  product_category: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Products image',
    example: 'product image',
  })
  product_image?: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Products description html',
    example: 'product description html',
  })
  product_description_html?: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  status: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_featured: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_veg: string;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products weight',
    example: '30.02',
  })
  weight: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  length: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  width: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  height: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Products rating',
    example: 'product rating',
  })
  product_rating?: string;

  @BelongsTo(() => ProductCategory)
  productCategory: ProductCategory;

}
