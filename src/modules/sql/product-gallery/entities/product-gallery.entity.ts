import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Index, Table } from 'sequelize-typescript';

@Table
export class ProductGallery extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'ProductGallery name',
    example: 'United States',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'ProductGallery code',
    example: 'US',
  })
  @IsString()
  code: string;
}
