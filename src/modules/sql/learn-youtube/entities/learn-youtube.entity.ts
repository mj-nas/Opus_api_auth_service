import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  Index,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';

@Table
export class LearnYoutube extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Title',
    example: 'Organic Hemp Cones',
  })
  @IsString()
  @MaxLength(60)
  title: string;

  @Column
  @ApiProperty({
    description: 'Youtube URL',
    example: 'https://www.youtube.com/watch?v=Rwe5Aw3KPHY',
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
  @ApiProperty({
    description: 'sort',
    example: '1',
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @BeforeCreate
  static async setSortMaxValue(instance: LearnYoutube) {
    const maxSort = await LearnYoutube.max('sort');
    const sort = maxSort as number;
    instance.sort = sort + 1;
  }

  @BeforeUpdate
  static async formatThumb(instance: LearnYoutube) {
    if (instance.thumb) {
      instance.thumb = instance.thumb.replace(config().cdnURL, '');
    }
  }
}
