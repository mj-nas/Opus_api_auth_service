import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import { Column, DataType, Index, Table } from 'sequelize-typescript';

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
  parent_category?: number;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @Index
  @ApiProperty({
    description: 'Category description',
    example: 'Category description html',
  })
  category_description?: string;

  @Column
  @Index
  @ApiProperty({
    description: 'category image',
    example: 'https://image',
  })
  category_image?: string;

  
  @Column
  @Index
  @ApiProperty({
    description: 'sort',
    example: '6',
  })
  sort:number;

  @Column({type: DataType.ENUM('Y', 'N')})
  @Index
  @ApiProperty({
    description: 'Y | N',
    example: 'Y',
  })
  @IsString()
  status: string;

}
