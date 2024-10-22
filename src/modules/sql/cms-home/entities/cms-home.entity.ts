import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, DataType, Index, Table } from 'sequelize-typescript';

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

  @Column({
    type: DataType.STRING(2000),
  })
  @Index
  @ApiProperty({
    description: 'CmsHome Content',
    example: 'Content',
  })
  @IsString()
  content: string;
}
