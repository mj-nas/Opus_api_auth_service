import { OmitType } from '@nestjs/swagger';
import { UserExams } from '../entities/user-exams.entity';

export class CreateUserExamsDto extends OmitType(UserExams, [
  'active',
  'is_complete',
  'attempted_percentage',
  'uid',
  'certificate_url',
] as const) {}
