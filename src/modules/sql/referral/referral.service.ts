import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Referral } from './entities/referral.entity';

@Injectable()
export class ReferralService extends ModelService<Referral> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Referral>) {
    super(db);
  }
}
