import { OmitType, PartialType } from '@nestjs/swagger';
import { LearningQuestionOptions } from '../entities/learning-question-options.entity';

export class UpdateLearningQuestionOptionsDto extends PartialType(
  OmitType(LearningQuestionOptions, [] as const),
) {}
