import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  BeforeCreate,
  Column,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { uuid } from 'src/core/core.utils';
import { ExamQuestions } from '../../exam-questions/entities/exam-questions.entity';

@Table
export class ExamQuestionSet extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Exam question set title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @BeforeCreate
  static setUuid(instance: ExamQuestionSet) {
    instance.uid = uuid();
  }

  @HasMany(() => ExamQuestions)
  questions: ExamQuestions[];
}
