import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ReferredCoupon } from './entities/referred-coupon.entity';

@Injectable()
export class ReferredCouponService extends ModelService<ReferredCoupon> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ReferredCoupon>) {
    super(db);
  }
}
