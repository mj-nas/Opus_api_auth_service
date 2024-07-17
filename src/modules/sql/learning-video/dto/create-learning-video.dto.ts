import { OmitType } from '@nestjs/swagger';
import { LearningVideo } from '../entities/learning-video.entity';

export class CreateLearningVideoDto extends OmitType(LearningVideo, ['active'] as const) {}
