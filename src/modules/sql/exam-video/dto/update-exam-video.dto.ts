import { OmitType, PartialType } from '@nestjs/swagger';
import { ExamVideo } from '../entities/exam-video.entity';

export class UpdateExamVideoDto extends PartialType(
  OmitType(ExamVideo, [] as const),
) {}
