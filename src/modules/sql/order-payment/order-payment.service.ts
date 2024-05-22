import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { OrderPayment } from './entities/order-payment.entity';

@Injectable()
export class OrderPaymentService extends ModelService<OrderPayment> {
  constructor(db: SqlService<OrderPayment>) {
    super(db);
  }
}
