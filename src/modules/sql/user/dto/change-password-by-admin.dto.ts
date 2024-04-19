import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ChangePasswordByAdminDto extends PickType(User, [
  'id',
  'password',
] as const) {}
