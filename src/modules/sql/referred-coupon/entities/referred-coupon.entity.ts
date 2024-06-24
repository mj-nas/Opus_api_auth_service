import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Index, Table } from 'sequelize-typescript';

@Table
export class ReferredCoupon extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'ReferredCoupon name',
    example: 'ReferredCoupon',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'ReferredCoupon title',
    example: 'Title',
  })
  @IsString()
  title: string;
}
