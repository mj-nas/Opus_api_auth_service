import { OmitType, PartialType } from '@nestjs/swagger';
import { ExamQuestionSet } from '../entities/exam-question-set.entity';

export class UpdateExamQuestionSetDto extends PartialType(
  OmitType(ExamQuestionSet, [] as const),
) {}
