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
  @IsNumber()
  question_set_id: number;

  @Column(DataTypes.TEXT({ length: 'long' }))
  @ApiProperty({
    description: 'LearningQuestions title',
    example: 'question',
  })
  @IsString()
  question: string;

  // @Include({
  //   attributes: ['id', 'option'],
  // })
  // @HasOne(() => LearningQuestionOptions)
  // correct_option: LearningQuestionOptions;

  @BelongsTo(() => LearningQuestionSet)
  question_set: LearningQuestionSet;

  @Include({
    attributes: ['id', 'option', 'is_correct'],
  })
  @HasMany(() => LearningQuestionOptions)
  options: LearningQuestionOptions[];
}
