import { OmitType, PartialType } from '@nestjs/swagger';
import { LearningQuestions } from '../entities/learning-questions.entity';

export class UpdateLearningQuestionsDto extends PartialType(
  OmitType(LearningQuestions, [] as const),
) {}
