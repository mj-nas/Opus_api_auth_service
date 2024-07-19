import { OmitType, PartialType } from '@nestjs/swagger';
import { ExamQuestionOptions } from '../entities/exam-question-options.entity';

export class UpdateExamQuestionOptionsDto extends PartialType(
  OmitType(ExamQuestionOptions, [] as const),
) {}
