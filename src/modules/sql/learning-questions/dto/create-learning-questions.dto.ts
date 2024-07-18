import { OmitType } from '@nestjs/swagger';
import { LearningQuestions } from '../entities/learning-questions.entity';

export class CreateLearningQuestionsDto extends OmitType(LearningQuestions, [
  'active',
] as const) {}
