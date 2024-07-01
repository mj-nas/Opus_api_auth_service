import { PickType } from '@nestjs/swagger';
import { Commission } from '../entities/commission.entity';

export class UpdateCommissionDto extends PickType(Commission, [
  'status',
] as const) {}
