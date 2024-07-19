import { OmitType, PartialType } from '@nestjs/swagger';
import { ExamModule } from '../entities/exam-module.entity';

export class UpdateExamModuleDto extends PartialType(
  OmitType(ExamModule, [] as const),
) {}
