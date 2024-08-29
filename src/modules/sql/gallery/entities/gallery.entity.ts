import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';
import { GalleryCategory } from '../../gallery-category/entities/gallery-category.entity';
import { GalleryType } from '../gallery-type.enum';

@Table
export class Gallery extends SqlModel {
  @Column({
    type: DataType.ENUM(...Object.values(GalleryType)),
    defaultValue: GalleryType.Image,
  })
  @ApiProperty({
    enum: GalleryType,
    description: 'GalleryType',
    example: GalleryType.Video,
  })
  @IsEnum(GalleryType)
  type: GalleryType;

  @ForeignKey(() => GalleryCategory)
  @Column
  @ApiProperty({
    description: 'Category',
    example: 1,
  })
  @IsString()
  category_id: number;

  @Column
  @Index
  @ApiProperty({
    description: 'File name',
    example: 'File one',
  })
  @IsString()
  name: string;

  @Column
  @ApiProperty({
    description: 'product image',
    example: 'thumbnail.png',
  })
  @ValidateIf((o) => o.type === GalleryType.Video)
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
  @ApiProperty({
    description: 'sort',
    example: '6',
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @Column
  @ApiProperty({
    description: 'product image',
    example: 'file_url.png',
  })
  @IsString()
  get file_url(): string {
    return this.getDataValue('file_url')
      ? config().cdnURL + this.getDataValue('file_url')
      : null;
  }

  set file_url(v: string) {
    this.setDataValue(
      'file_url',
      typeof v === 'string' ? v.replace(config().cdnURL, '') : null,
    );
  }

  @Include({
    attributes: ['id', 'name', 'sort', 'status'],
    required: false,
  })
  @BelongsTo(() => GalleryCategory)
  category: GalleryCategory;

  @BeforeUpdate
  static async formatThumb(instance: Gallery) {
    if (instance.thumbnail) {
      instance.thumbnail = instance.thumbnail.replace(config().cdnURL, '');
    }
  }

  @BeforeUpdate
  static async formatFileUrl(instance: Gallery) {
    if (instance.file_url) {
      instance.file_url = instance.file_url.replace(config().cdnURL, '');
    }
  }

  @BeforeCreate
  static async setSortMaxValue(instance: Gallery) {
    const maxSort = await Gallery.max('sort');
    const sort = maxSort as number;
    instance.sort = sort + 1;
  }
}
