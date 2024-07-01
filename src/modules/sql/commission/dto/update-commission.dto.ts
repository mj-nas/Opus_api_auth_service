import { OmitType, PartialType } from '@nestjs/swagger';
import { Commission } from '../entities/commission.entity';

export class UpdateCommissionDto extends PartialType(
  OmitType(Commission, [] as const),
) {}
