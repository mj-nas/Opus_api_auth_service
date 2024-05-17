import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { OrderAddress } from './entities/order-address.entity';

@Injectable()
export class OrderAddressService extends ModelService<OrderAddress> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<OrderAddress>) {
    super(db);
  }
}
