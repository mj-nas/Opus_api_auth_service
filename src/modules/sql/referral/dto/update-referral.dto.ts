import { OmitType, PartialType } from '@nestjs/swagger';
import { Referral } from '../entities/referral.entity';

export class UpdateReferralDto extends PartialType(
  OmitType(Referral, [] as const),
) {}
