import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponService extends ModelService<Coupon> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Coupon>) {
    super(db);
  }
}
