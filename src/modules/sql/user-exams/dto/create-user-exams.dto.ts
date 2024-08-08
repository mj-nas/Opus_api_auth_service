import { PickType } from '@nestjs/swagger';
import { UserExams } from '../entities/user-exams.entity';

export class CreateUserExamsDto extends PickType(UserExams, [
  'user_id',
] as const) {}
