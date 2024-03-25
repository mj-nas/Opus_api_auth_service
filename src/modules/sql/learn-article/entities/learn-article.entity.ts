import { SqlModel } from '@core/sql/sql.model';
import { IsUnique } from '@core/sql/sql.unique-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { Column, DataType, Index, Table } from 'sequelize-typescript';
import config from 'src/config';

@Table
export class LearnArticle extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Title',
    example: 'Organic Hemp Cones',
  })
  @IsString()
  @MaxLength(60)
  title: string;

  @Column({
    type: DataType.STRING(255),
  })
  @ApiProperty({
    description: 'Description',
    example:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  })
  @IsString()
  @MaxLength(255)
  description: string;

  @Column
  @ApiProperty({
    description: 'Date',
    example: '2021-01-01',
    type: Date,
  })
  @IsString()
  date: string;

  @Column
  @ApiProperty({
    description: 'External URL',
    example:
      'https://newagesysit.com/types-of-grocery-shopping-apps-that-app-companies-can-develop-in-new-york/',
  })
  @IsString()
  url: string;

  @Column
  @ApiProperty({
    description: 'Youtube thumb image',
    example: 'thumb.png',
  })
  @IsString()
  get thumb(): string {
    return this.getDataValue('thumb')
      ? config().cdnURL + this.getDataValue('thumb')
      : null;
  }

  set thumb(v: string) {
    this.setDataValue(
      'thumb',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Column
  @IsUnique('LearnArticle')
  @ApiProperty({
    description: 'sort',
    example: '1',
  })
  sort: number;
}
