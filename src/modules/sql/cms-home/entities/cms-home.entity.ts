import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import {
  BeforeUpdate,
  Column,
  DataType,
  Index,
  Table,
} from 'sequelize-typescript';
import config from 'src/config';
import { InputType } from '../input-type.enum';

@Table
export class CmsHome extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'CmsHome name',
    example: 'CmsHome',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'CmsHome title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Group',
    example: 'Group',
  })
  @IsString()
  group: string;

  @Column
  @Index
  @ApiProperty({
    description: 'Order',
    example: 'Order',
  })
  @IsNumber()
  order: string;

  @Column({
    type: DataType.STRING(500),
  })
  @Index
  @ApiProperty({
    description: 'CmsHome Content',
    example: 'Content',
  })
  @IsString()
  get content(): string {
    return this.getDataValue('input_type') == InputType.File
      ? config().cdnURL + this.getDataValue('content')
      : this.getDataValue('content');
  }

  set content(v: string) {
    this.setDataValue(
      'content',
      typeof v === 'string' && this.getDataValue('input_type') == InputType.File
        ? v.replace(config().cdnURL, '')
        : v,
    );
  }

  @Column({
    type: DataType.ENUM(...Object.values(InputType)),
    defaultValue: InputType.Editor,
  })
  @Index
  @ApiProperty({
    enum: InputType,
    example: InputType.Editor,
    description: 'Input Type',
  })
  @IsEnum(InputType)
  input_type: InputType;

  @BeforeUpdate
  static async formatThumb(instance: CmsHome) {
    if (instance.content) {
      instance.content =
        instance.input_type == InputType.File
          ? instance.content.replace(config().cdnURL, '')
          : instance.content;
    }
  }
}
