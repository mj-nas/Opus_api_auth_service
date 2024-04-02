import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PickType(User, [
  'first_name',
  'last_name',
  'phone',
  'password',
  'avatar',
  'email',
  'address',
  'city',
  'state',
  'zip_code',
] as const) {}
