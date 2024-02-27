/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { slugify } from 'src/core/core.utils';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { ProductGallery } from '../../product-gallery/entities/product-gallery.entity';
import { ProductSpecifications } from '../../product-specifications/entities/product-specifications.entity';

@Table
export class Products extends SqlModel {
  @Column({ unique: true })
  @ApiProperty({
    description: 'Slug',
    example: 'product-slug',
    readOnly: true,
  })
  slug: string;

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
  @IsNumber()
  product_price: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @Index
  @ApiProperty({
    description: 'Products Description',
    example: 32.04,
  })
  @IsNumber()
  wholesale_price: number;

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
    description: 'Products width lbs',
    example: '30.02',
  })
  @IsNumber()
  weight_lbs: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products width Ounce',
    example: '30.02',
  })
  @IsOptional()
  weight_ounce: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  length: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  width: number;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  height: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Products rating',
    example: 1,
  })
  @IsOptional()
  product_rating: number;

  @BelongsTo(() => ProductCategory)
  productCategory: ProductCategory;
  @HasMany(() => ProductGallery)
  productGallery: ProductGallery[];

  @HasMany(() => ProductSpecifications)
  productSpecifications: ProductSpecifications[];

  @BeforeCreate
  static async setUuid(instance: Products) {
    const slug = slugify(instance.product_name);

    // Check if the generated slug already exists in the database
    let uniqueSlug = slug;
    let num = 2;
    while (await Products.findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${num}`;
      num++;
    }

    // Assign the unique slug to the instance
    instance.slug = uniqueSlug;
  }
}
