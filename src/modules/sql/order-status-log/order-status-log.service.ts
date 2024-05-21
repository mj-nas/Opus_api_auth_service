import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { OrderStatusLog } from './entities/order-status-log.entity';

@Injectable()
export class OrderStatusLogService extends ModelService<OrderStatusLog> {
  constructor(db: SqlService<OrderStatusLog>) {
    super(db);
  }
}
