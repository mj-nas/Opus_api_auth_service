import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import { Column, DataType, Index, Table } from 'sequelize-typescript';

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

  @Column(DataTypes.TEXT({ length: 'long' }))
  @Index
  @ApiProperty({
    description: 'Products Description',
    example: 'product description',
  })
  @IsString()
  product_description: string;

  @Column(DataTypes.FLOAT)
  @Index
  @ApiProperty({
    description: 'Products Description',
    example: 'product description',
  })
  @IsString()
  product_price: number;

  @Column
  @Index
  @ApiProperty({
    description: 'Products category',
    example: 'product category',
  })
  @IsString()
  product_category: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Products image',
    example: 'product image',
  })
  product_image?: string;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @Index
  @ApiProperty({
    description: 'Products description html',
    example: 'product description html',
  })
  product_description_html?: string;

  @Column({type: DataType.ENUM('Y', 'N')})
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  status: string;

  @Column({type: DataType.ENUM('Y', 'N')})
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  is_featured: string;

  @Column({type: DataType.ENUM('Y', 'N')})
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

}
