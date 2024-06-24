import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Index, Table } from 'sequelize-typescript';

@Table
export class ReferredProducts extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'ReferredProducts name',
    example: 'ReferredProducts',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'ReferredProducts title',
    example: 'Title',
  })
  @IsString()
  title: string;
}
