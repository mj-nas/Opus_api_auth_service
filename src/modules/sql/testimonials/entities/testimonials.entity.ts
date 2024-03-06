import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Index, Table } from 'sequelize-typescript';

@Table
export class Testimonials extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Testimonials name',
    example: 'United States',
  })
  @IsString()
  name: string;

  @Column
  @Index
  @ApiProperty({
    description: 'speciality',
    example: 'Surgon',
  })
  @IsString()
  speciality: string;

  @Column
  @Index
  @ApiProperty({
    description: 'quote',
    example: 'quote',
  })
  @IsString()
  quote: string;
}
