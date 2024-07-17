import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Index,
  Table,
} from 'sequelize-typescript';
import { LearningQuestionOptions } from '../../learning-question-options/entities/learning-question-options.entity';
import { LearningQuestionSet } from '../../learning-question-set/entities/learning-question-set.entity';

@Table
export class LearningQuestions extends SqlModel {
  @ForeignKey(() => LearningQuestionSet)
  @Column
  @Index
  @ApiProperty({
    description: 'Question set id',
    example: 1,
  })
  question_set_id: number;

  @ForeignKey(() => LearningQuestionOptions)
  @Column
  @Index
  @ApiProperty({
    description: 'Correct option id',
    example: 1,
  })
  correct_option_id: number;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @Index
  @ApiProperty({
    description: 'LearningQuestions title',
    example: 'question',
  })
  @IsString()
  question: string;

  @Include({
    attributes: ['id', 'option'],
  })
  @HasOne(() => LearningQuestionOptions)
  correct_option: LearningQuestionOptions;

  @Include({
    attributes: ['id', 'option'],
  })
  @HasMany(() => LearningQuestionOptions)
  options: LearningQuestionOptions[];
}
