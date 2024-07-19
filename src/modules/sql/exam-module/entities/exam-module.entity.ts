import { SqlModel } from '@core/sql/sql.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { ExamQuestionSet } from '../../exam-question-set/entities/exam-question-set.entity';
import { ExamVideo } from '../../exam-video/entities/exam-video.entity';
import { UserExams } from '../../user-exams/entities/user-exams.entity';

@Table
export class ExamModule extends SqlModel {
  @Column
  @Index
  @ApiProperty({
    description: 'Exam Module title',
    example: 'Title',
  })
  @IsString()
  title: string;

  @ForeignKey(() => UserExams)
  @Column
  @Index
  @ApiProperty({
    description: 'User exam id',
    example: 1,
  })
  exam_id: number;

  @ForeignKey(() => ExamQuestionSet)
  @Column
  @Index
  @ApiProperty({
    description: 'Question set id',
    example: 1,
  })
  question_set_id: number;

  @ForeignKey(() => ExamVideo)
  @Column
  @Index
  @ApiProperty({
    description: 'Video id',
    example: 1,
  })
  video_id: number;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'video completed or not',
    example: true,
  })
  @IsBoolean()
  video_complete: boolean;

  @Column({ defaultValue: false })
  @ApiProperty({
    description: 'module completed or not',
    example: true,
  })
  @IsBoolean()
  module_complete: boolean;

  @BelongsTo(() => ExamQuestionSet)
  question_set: ExamQuestionSet;

  @BelongsTo(() => ExamVideo)
  video: ExamVideo;
}
