import { OmitType, PartialType } from '@nestjs/swagger';
import { LearningQuestionSet } from '../entities/learning-question-set.entity';

export class UpdateLearningQuestionSetDto extends PartialType(
  OmitType(LearningQuestionSet, [] as const),
) {}
