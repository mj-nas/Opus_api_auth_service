/* eslint-disable prettier/prettier */
import { Include } from '@core/sql/sql.decorator';
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
  HasOne,
  Index,
  Table,
} from 'sequelize-typescript';
import { slugify } from 'src/core/core.utils';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { ProductGallery } from '../../product-gallery/entities/product-gallery.entity';
import { ProductReview } from '../../product-review/entities/product-review.entity';
import { ProductSpecifications } from '../../product-specifications/entities/product-specifications.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

@Table
export class Products extends SqlModel {
  @Index
  @Column({ unique: true })
  @ApiProperty({
    description: 'Slug',
    example: 'product-slug',
    readOnly: true,
  })
  slug: string;

  @Column
  @ApiProperty({
    description: 'Products name',
    example: 'product name',
  })
  @IsString()
  product_name: string;

  @Column({
    type: DataType.STRING(500),
  })
  @ApiProperty({
    description: 'Products Description',
    example: 'product description',
  })
  @IsString()
  product_description: string;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Products Description',
    example: 32.04,
  })
  @IsNumber()
  product_price: number;

  @Column(DataTypes.FLOAT({ precision: 11, scale: 2 }))
  @ApiProperty({
    description: 'Products Description',
    example: 32.04,
  })
  @IsNumber()
  wholesale_price: number;

  @ForeignKey(() => ProductCategory)
  @Column
  @ApiProperty({
    description: 'Products category',
    example: 1,
  })
  @IsString()
  product_category: number;

  @Column
  @ApiProperty({
    description: 'Products image',
    example: 'product image',
  })
  @IsOptional()
  product_image: string;

  @Column({
    type: DataType.STRING(500),
  })
  @ApiProperty({
    description: 'Products description html',
    example: 'product description html',
  })
  @IsOptional()
  product_description_html: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  status: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_featured: string;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_veg: string;

  @Column(DataTypes.FLOAT)
  @ApiProperty({
    description: 'Products width lbs',
    example: '30.02',
  })
  @IsNumber()
  weight_lbs: number;

  @Column(DataTypes.FLOAT)
  @ApiProperty({
    description: 'Products width Ounce',
    example: '30.02',
  })
  @IsOptional()
  weight_ounce: number;

  @Column(DataTypes.FLOAT)
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  length: number;

  @Column(DataTypes.FLOAT)
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  width: number;

  @Column(DataTypes.FLOAT)
  @ApiProperty({
    description: 'Products length',
    example: '30.02',
  })
  @IsNumber()
  height: number;

  @Column
  @ApiProperty({
    description: 'Products rating',
    example: 1,
  })
  @IsOptional()
  product_rating: number;

  @Include({
    attributes: ['id', 'category_name', 'category_image'],
  })
  @BelongsTo(() => ProductCategory)
  productCategory: ProductCategory;

  @Include({ attributes: ['id', 'product_image', 'is_primary'] })
  @HasMany(() => ProductGallery)
  productGallery: ProductGallery[];

  @Include({ attributes: ['product_image'], where: { is_primary: 'Y' } })
  @HasOne(() => ProductGallery)
  product_primary_image: ProductGallery;

  @HasMany(() => ProductSpecifications)
  productSpecifications: ProductSpecifications[];

  @HasMany(() => ProductReview)
  product_reviews: ProductReview[];

  @Include({
    attributes: ['user_id', 'product_id'],
  })
  @HasOne(() => Wishlist)
  wishlisted: Wishlist;

  @BeforeCreate
  static async setSlug(instance: Products) {
    const slug = slugify(instance.product_name);

    // Check if the generated slug already exists in the database
    let uniqueSlug = slug;
    let num = 2;
    while (
      await Products.findOne({ where: { slug: uniqueSlug }, paranoid: false })
    ) {
      uniqueSlug = `${slug}-${num}`;
      num++;
    }

    // Assign the unique slug to the instance
    instance.slug = uniqueSlug;
  }
}
