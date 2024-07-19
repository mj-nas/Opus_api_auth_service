import { OmitType } from '@nestjs/swagger';
import { ExamQuestionOptions } from '../entities/exam-question-options.entity';

export class CreateExamQuestionOptionsDto extends OmitType(ExamQuestionOptions, ['active'] as const) {}
