import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BeforeCreate,
  Column,
  DataType,
  Index,
  Table,
} from 'sequelize-typescript';

@Table
export class GalleryCategory extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'GalleryCategory name',
    example: 'United States',
  })
  @IsString()
  name: string;

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

  @BeforeCreate
  static async setSortMaxValue(instance: GalleryCategory) {
    const maxSort = await GalleryCategory.max('sort');
    const sort = maxSort as number;
    instance.sort = sort + 1;
  }
}
