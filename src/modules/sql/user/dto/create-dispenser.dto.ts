import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class CreateDispenserDto extends PickType(User, [
  'first_name',
  'last_name',
  'phone',
  'avatar',
  'email',
  'address',
  'address2',
  'city',
  'state',
  'zip_code',
  'longitude',
  'latitude',
  'business_name',
  'role',
] as const) {}
