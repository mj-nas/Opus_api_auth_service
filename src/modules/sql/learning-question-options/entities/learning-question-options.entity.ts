import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DataTypes } from 'sequelize';
import { Column, ForeignKey, Index, Table } from 'sequelize-typescript';
import { LearningQuestions } from '../../learning-questions/entities/learning-questions.entity';

@Table
export class LearningQuestionOptions extends SqlModel {
  @ForeignKey(() => LearningQuestions)
  @Column
  @Index
  @ApiProperty({
    description: 'Question id',
    example: 1,
  })
  @IsNumber()
  question_id: number;

  @Column(DataTypes.TEXT({ length: 'medium' }))
  @ApiProperty({
    description: 'Option',
    example: 'answer',
  })
  @IsString()
  option: string;

  @Column({ defaultValue: false })
  @Index
  @ApiProperty({
    description: 'Is correct option',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_correct: boolean;
}
