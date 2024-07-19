import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, HasMany, Index, Table } from 'sequelize-typescript';
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

  @HasMany(() => ExamQuestions)
  questions: ExamQuestions[];
}
