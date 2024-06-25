import { OmitType } from '@nestjs/swagger';
import { Referral } from '../entities/referral.entity';

export class CreateReferralDto extends OmitType(Referral, [
  'active',
] as const) {}
