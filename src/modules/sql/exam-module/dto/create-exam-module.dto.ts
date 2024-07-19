import { OmitType } from '@nestjs/swagger';
import { ExamModule } from '../entities/exam-module.entity';

export class CreateExamModuleDto extends OmitType(ExamModule, ['active'] as const) {}
