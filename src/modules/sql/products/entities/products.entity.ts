/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  Table,
  Column,
  Index,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { ProductGallery } from '../../product-gallery/entities/product-gallery.entity';
import { ProductSpecifications } from '../../product-specifications/entities/product-specifications.entity';

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

  @Column({
    type: DataType.STRING(500),
  })
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
    example: 1,
  })
  @IsString()
  product_category: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Products image',
    example: 'product image',
  })
  @IsOptional()
  product_image: string;

  @Column({
    type: DataType.STRING(500),
  })
  @Index
  @ApiProperty({
    description: 'Products description html',
    example: 'product description html',
  })
  @IsOptional()
  product_description_html: string;

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
    example: 1,
  })
  @IsOptional()
  product_rating:number;

  @BelongsTo(() => ProductCategory)
  productCategory: ProductCategory;
  @HasMany(() => ProductGallery)
  productGallery: ProductGallery[];

  @HasMany(() => ProductSpecifications)
  productSpecifications: ProductSpecifications[];

}
