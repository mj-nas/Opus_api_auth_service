import { OmitType, PartialType } from '@nestjs/swagger';
import { LearningVideo } from '../entities/learning-video.entity';

export class UpdateLearningVideoDto extends PartialType(
  OmitType(LearningVideo, [] as const),
) {}
