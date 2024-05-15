import { OmitType, PartialType } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';

export class UpdateAddressDto extends PartialType(
  OmitType(Address, [] as const),
) {}
