import { OmitType, PartialType } from '@nestjs/swagger';
import { UserExams } from '../entities/user-exams.entity';

export class UpdateUserExamsDto extends PartialType(
  OmitType(UserExams, [] as const),
) {}
