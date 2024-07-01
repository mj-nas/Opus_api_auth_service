import { OmitType } from '@nestjs/swagger';
import { Commission } from '../entities/commission.entity';

export class CreateCommissionDto extends OmitType(Commission, ['active'] as const) {}
