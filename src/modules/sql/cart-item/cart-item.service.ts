import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemService extends ModelService<CartItem> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<CartItem>) {
    super(db);
  }
}
