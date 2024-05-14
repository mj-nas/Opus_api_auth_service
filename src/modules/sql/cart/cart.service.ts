import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService extends ModelService<Cart> {
  constructor(db: SqlService<Cart>) {
    super(db);
  }
}
