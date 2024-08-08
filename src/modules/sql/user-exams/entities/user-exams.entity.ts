import { SqlModel } from '@core/sql/sql.model';
import { IsUnique } from '@core/sql/sql.unique-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  Column,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { uuid } from 'src/core/core.utils';
import { ExamModule } from '../../exam-module/entities/exam-module.entity';
import { User } from '../../user/entities/user.entity';

@Table
export class UserExams extends SqlModel {
  @ForeignKey(() => User)
  @Column
  @Index
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @IsNumber()
  @IsUnique('UserExams', {
    message: 'The User Id already exists. Please try with a different Id.',
  })
  user_id: number;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'exam completed or not',
    example: true,
  })
  @IsBoolean()
  is_complete: boolean;

  @Column({ defaultValue: '0' })
  @ApiProperty({
    description: 'attempted_percentage',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  attempted_percentage: number;

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  @IsString()
  uid: string;

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'MUHA-',
    readOnly: true,
  })
  @IsString()
  cert_id: string;

  @Column
  @ApiProperty({
    description: 'Certificate URL',
    example: 'https://www.example.com/certificate.pdf',
  })
  @IsString()
  @IsOptional()
  certificate: string;

  @Column
  @ApiProperty({
    description: 'Certificate URL',
    example: 'https://www.example.com/certificate.jpg',
  })
  @IsString()
  @IsOptional()
  certificate_img: string;

  @Column
  @ApiProperty({
    description: 'Completed Date',
    example: '2022-02-02',
  })
  @IsString()
  @IsOptional()
  completed_date: Date;

  @Column(DataTypes.VIRTUAL)
  @ApiProperty({
    description: 'Certificate Pdf URl',
    example:
      'https://staging.opuscompounds.com/certificate/cd7c8da0-cfe0-11ee-94e2-c1e32bf24f34.pdf',
    readOnly: true,
  })
  get certificate_url(): string {
    return this.getDataValue('certificate')
      ? `${process.env.CDN_URL}${this.getDataValue('certificate')}`
      : null;
  }
  @Column(DataTypes.VIRTUAL)
  @ApiProperty({
    description: 'Certificate Image URl',
    example:
      'https://staging.opuscompounds.com/certificate/cd7c8da0-cfe0-11ee-94e2-c1e32bf24f34.jpg',
    readOnly: true,
  })
  get certificate_img_url(): string {
    return this.getDataValue('certificate_img')
      ? `${process.env.CDN_URL}${this.getDataValue('certificate_img')}`
      : null;
  }

  @BeforeCreate
  static setUuid(instance: UserExams) {
    instance.uid = uuid();
  }

  @HasMany(() => ExamModule)
  exam_modules: ExamModule[];
}
