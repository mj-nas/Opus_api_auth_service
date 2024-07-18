import { OmitType } from '@nestjs/swagger';
import { LearningQuestionSet } from '../entities/learning-question-set.entity';

export class CreateLearningQuestionSetDto extends OmitType(LearningQuestionSet, ['active'] as const) {}
