import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ReferredCoupons } from './entities/referred-coupon.entity';

@Injectable()
export class ReferredCouponService extends ModelService<ReferredCoupons> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ReferredCoupons>) {
    super(db);
  }
}
