import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { uuid } from 'src/core/core.utils';
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

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @BeforeCreate
  static setUuid(instance: LearningQuestions) {
    instance.uid = uuid();
  }

  @BelongsTo(() => LearningQuestionSet)
  question_set: LearningQuestionSet;

  @Include({
    attributes: ['id', 'option', 'is_correct'],
  })
  @HasMany(() => LearningQuestionOptions)
  options: LearningQuestionOptions[];

  @Include({
    where: { active: true },
  })
  @HasMany(() => LearningQuestionOptions)
  web_options: LearningQuestionOptions[];
}
