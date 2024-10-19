import { PickType } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';

export class CreateAddressDto extends PickType(Address, [
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'address2',
  'city',
  'state',
  'zip_code',
] as const) {}
