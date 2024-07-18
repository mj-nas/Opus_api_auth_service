import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  Index,
  Table,
} from 'sequelize-typescript';
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

  @Column
  @ApiProperty({
    description: 'Video',
    example: 'video.mp4',
  })
  @IsString()
  get video(): string {
    return this.getDataValue('video')
      ? config().cdnURL + this.getDataValue('video')
      : null;
  }

  set video(v: string) {
    this.setDataValue(
      'video',
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
  static async setSortMaxValue(instance: LearningVideo) {
    const maxSort = await LearningVideo.max('sort');
    const sort = maxSort as number;
    instance.sort = sort + 1;
  }

  @BeforeUpdate
  static async formatThumb(instance: LearningVideo) {
    if (instance.thumbnail) {
      instance.thumbnail = instance.thumbnail.replace(config().cdnURL, '');
    }
  }
}
