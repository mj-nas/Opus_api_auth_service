/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BeforeCreate,
  Column,
  DataType,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';
import { Products } from '../../products/entities/products.entity';

@Table
export class ProductCategory extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Product Category name',
    example: 'product category name',
  })
  @IsString()
  category_name: string;

  @Column
  @ApiProperty({
    description: 'parrent categoy',
    example: 'US',
  })
  @IsOptional()
  parent_category: number;

  @Column({
    type: DataType.STRING(500),
  })
  @ApiProperty({
    description: 'Category description',
    example: 'Category description html',
  })
  @IsOptional()
  category_description: string;

  @Column
  @ApiProperty({
    description: 'Category Image',
    example: 'image1.png',
  })
  @IsString()
  get category_image(): string {
    return this.getDataValue('category_image')
      ? config().cdnURL + this.getDataValue('category_image')
      : null;
  }

  set category_image(v: string) {
    this.setDataValue(
      'category_image',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Column
  @ApiProperty({
    description: 'sort',
    example: '6',
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue: 'Y' })
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsOptional()
  status: string;

  @HasMany(() => Products)
  products: Products[];

  @BeforeCreate
  static async setSortMaxValue(instance: ProductCategory) {
    const sort = await ProductCategory.max('sort');
    instance.sort = sort as number;
  }
}
