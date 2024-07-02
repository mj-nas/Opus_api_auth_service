import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { CouponUsed } from './entities/coupon-used.entity';

@Injectable()
export class CouponUsedService extends ModelService<CouponUsed> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [];

  constructor(db: SqlService<CouponUsed>) {
    super(db);
  }
}
