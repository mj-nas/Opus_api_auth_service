/* eslint-disable prettier/prettier */
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Column, DataType, HasMany, Index, Table } from 'sequelize-typescript';
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
  @Index
  @ApiProperty({
    description: 'parrent categoy',
    example: 'US',
  })
  @IsOptional()
  parent_category: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Category description',
    example: 'Category description html',
  })
  @IsOptional()
  category_description: string;

  @Column
  @Index
  @ApiProperty({
    description: 'category image',
    example: 'https://image',
  })
  @IsOptional()
  category_image: string;

  @Column
  @Index
  @ApiProperty({
    description: 'sort',
    example: '6',
  })
  sort: number;

  @Column({ type: DataType.ENUM('Y', 'N') })
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  status: string;

  @HasMany(() => Products)
  products: Products[];

}
