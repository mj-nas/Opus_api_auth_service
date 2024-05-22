import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderStatus } from '../order/order-status.enum';
import { OrderPayment } from './entities/order-payment.entity';
import { PaymentStatus } from './payment-status.enum';

@Injectable()
export class OrderPaymentService extends ModelService<OrderPayment> {
  constructor(
    db: SqlService<OrderPayment>,
    private _msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<OrderPayment>,
    response: SqlUpdateResponse<OrderPayment>,
  ): Promise<void> {
    if (
      job.action === 'payment.status.update' &&
      response.data.status === PaymentStatus.Completed
    ) {
      await this._msClient.executeJob('order.status.update', {
        payload: {
          order_id: response.data.order_id,
          status: OrderStatus.Ordered,
        },
      });
    }
  }
}
