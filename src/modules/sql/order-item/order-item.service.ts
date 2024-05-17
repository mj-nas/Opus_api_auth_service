import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemService extends ModelService<OrderItem> {
  constructor(db: SqlService<OrderItem>) {
    super(db);
  }
}
