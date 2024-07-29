import { SqlModel } from '@core/sql/sql.model';
import { IsUnique } from '@core/sql/sql.unique-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
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
  @IsString()
  @IsOptional()
  attempted_percentage: string;

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  @IsString()
  uid: string;

  @Column
  @ApiProperty({
    description: 'Certificate URL',
    example: 'https://www.example.com/certificate.pdf',
  })
  @IsString()
  @IsOptional()
  certificate_url: string;

  @BeforeCreate
  static setUuid(instance: UserExams) {
    instance.uid = uuid();
  }

  @HasMany(() => ExamModule)
  exam_modules: ExamModule[];
}
