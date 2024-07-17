import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import { Column, Index, Table } from 'sequelize-typescript';
import config from 'src/config';

@Table
export class LearningVideo extends SqlModel {
  @Column
  @ApiProperty({
    description: 'Thumbnail',
    example: 'thumbnail.png',
  })
  @IsString()
  get thumbnail(): string {
    return this.getDataValue('thumbnail')
      ? config().cdnURL + this.getDataValue('thumbnail')
      : null;
  }

  set thumbnail(v: string) {
    this.setDataValue(
      'thumbnail',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Column
  @Index
  @ApiProperty({
    description: 'LearningVideo title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @Column(DataTypes.VIRTUAL)
  @ApiProperty({
    description: 'Video Link',
    example:
      'https://staging.opuscompounds.com/connect/cd7c8da0-cfe0-11ee-94e2-c1e32bf24f34',
    readOnly: true,
  })
  get video_link(): string {
    return this.getDataValue('title')
      ? config().cdnURL + this.getDataValue('title')
      : null;
  }
}
