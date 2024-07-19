import { OmitType } from '@nestjs/swagger';
import { ExamQuestionSet } from '../entities/exam-question-set.entity';

export class CreateExamQuestionSetDto extends OmitType(ExamQuestionSet, ['active'] as const) {}
