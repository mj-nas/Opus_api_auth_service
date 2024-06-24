import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { Referral } from './entities/referral.entity';

@Module({
  imports: [SqlModule.register(Referral)],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
