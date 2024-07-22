import { Include } from '@core/sql/sql.decorator';
import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BeforeCreate,
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
  @IsNumber()
  question_set_id: number;

  @ForeignKey(() => LearningVideo)
  @Column
  @Index
  @ApiProperty({
    description: 'Video id',
    example: 1,
  })
  @IsNumber()
  video_id: number;

  @Column
  @ApiProperty({
    description: 'sort',
    example: '1',
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @BeforeCreate
  static async setSortMaxValue(instance: LearningModule) {
    const maxSort = await LearningModule.max('sort');
    const sort = maxSort as number;
    instance.sort = sort + 1;
  }

  @BelongsTo(() => LearningQuestionSet)
  question_set: LearningQuestionSet;

  @Include({
    where: { active: true },
  })
  @BelongsTo(() => LearningQuestionSet)
  web_question_set: LearningQuestionSet;

  @BelongsTo(() => LearningVideo)
  video: LearningVideo;

  @Include({
    where: { active: true },
  })
  @BelongsTo(() => LearningVideo)
  web_video: LearningVideo;
}
