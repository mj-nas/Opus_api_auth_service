import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, HasMany, Index, Table } from 'sequelize-typescript';
import { LearningQuestions } from '../../learning-questions/entities/learning-questions.entity';

@Table
export class LearningQuestionSet extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'LearningQuestionSet title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @HasMany(() => LearningQuestions)
  questions: LearningQuestions[];
}
