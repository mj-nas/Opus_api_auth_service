import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { ExamQuestionOptions } from '../../exam-question-options/entities/exam-question-options.entity';
import { ExamQuestionSet } from '../../exam-question-set/entities/exam-question-set.entity';

@Table
export class ExamQuestions extends SqlModel {
  @ForeignKey(() => ExamQuestionSet)
  @Column
  @Index
  @ApiProperty({
    description: 'Question set id',
    example: 1,
  })
  @IsNumber()
  question_set_id: number;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @ApiProperty({
    description: 'LearningQuestions title',
    example: 'question',
  })
  @IsString()
  question: string;

  @BelongsTo(() => ExamQuestionSet)
  question_set: ExamQuestionSet;

  @Include({
    attributes: ['id', 'option', 'is_correct'],
  })
  @HasMany(() => ExamQuestionOptions)
  options: ExamQuestionOptions[];
}
