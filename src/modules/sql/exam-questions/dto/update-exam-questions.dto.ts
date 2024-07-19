import { OmitType, PartialType } from '@nestjs/swagger';
import { ExamQuestions } from '../entities/exam-questions.entity';

export class UpdateExamQuestionsDto extends PartialType(
  OmitType(ExamQuestions, [] as const),
) {}
