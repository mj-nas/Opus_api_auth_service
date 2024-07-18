import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { LearningQuestionSet } from '../../learning-question-set/entities/learning-question-set.entity';
import { LearningVideo } from '../../learning-video/entities/learning-video.entity';

@Table
export class LearningModule extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'LearningModule title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @ForeignKey(() => LearningQuestionSet)
  @Column
  @Index
  @ApiProperty({
    description: 'Question set id',
    example: 1,
  })
  question_set_id: number;

  @ForeignKey(() => LearningVideo)
  @Column
  @Index
  @ApiProperty({
    description: 'Video id',
    example: 1,
  })
  video_id: number;

  @BelongsTo(() => LearningQuestionSet)
  question_set: LearningQuestionSet;

  @BelongsTo(() => LearningVideo)
  video: LearningVideo;
}
