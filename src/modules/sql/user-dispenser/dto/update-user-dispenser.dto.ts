import { OmitType, PartialType } from '@nestjs/swagger';
import { UserDispenser } from '../entities/user-dispenser.entity';

export class UpdateUserDispenserDto extends PartialType(
  OmitType(UserDispenser, [] as const),
) {}
