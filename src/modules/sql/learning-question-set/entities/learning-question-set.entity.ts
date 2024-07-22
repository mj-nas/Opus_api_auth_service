import { Include } from '@core/sql/sql.decorator';
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

  @Column({ unique: 'uid' })
  @ApiProperty({
    description: 'Unique ID',
    example: 'a926d382-6741-4d95-86cf-1f5c421cf654',
    readOnly: true,
  })
  uid: string;

  @BeforeCreate
  static setUuid(instance: LearningQuestionSet) {
    instance.uid = uuid();
  }

  @HasMany(() => LearningQuestions)
  questions: LearningQuestions[];

  @Include({
    where: { active: true },
  })
  @HasMany(() => LearningQuestions)
  web_questions: LearningQuestions[];
}
