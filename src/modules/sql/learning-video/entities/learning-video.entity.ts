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
import { uuid } from 'src/core/core.utils';

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

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @BeforeCreate
  static setUuid(instance: LearningVideo) {
    instance.uid = uuid();
  }

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

  @BeforeUpdate
  static async formatVideo(instance: LearningVideo) {
    if (instance.video) {
      instance.video = instance.video.replace(config().cdnURL, '');
    }
  }
}
