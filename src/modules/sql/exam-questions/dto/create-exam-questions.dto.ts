import { OmitType } from '@nestjs/swagger';
import { ExamQuestions } from '../entities/exam-questions.entity';

export class CreateExamQuestionsDto extends OmitType(ExamQuestions, ['active'] as const) {}
