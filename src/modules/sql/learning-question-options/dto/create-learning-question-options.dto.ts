import { OmitType } from '@nestjs/swagger';
import { LearningQuestionOptions } from '../entities/learning-question-options.entity';

export class CreateLearningQuestionOptionsDto extends OmitType(LearningQuestionOptions, ['active'] as const) {}
