import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses, MsEventListener } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { snakeCase } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderStatus } from '../order/order-status.enum';
import { OrderPayment } from './entities/order-payment.entity';
import { OrderPaymentService } from './order-payment.service';

const entity = snakeCase(OrderPayment.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderPayment)
@Controller(entity)
export class OrderPaymentController {
  constructor(
    private _msClient: MsClientService,
    private _orderPaymentService: OrderPaymentService,
  ) {}

  /**
   * Queue listener for payment status update
   */
  @MsEventListener('payment.status.update')
  async userListener(job: Job): Promise<void> {
    const { payment_link, status } = job.payload;
    const response = await this._orderPaymentService.$db.findAndUpdateRecord({
      action: 'payment.status.update',
      options: {
        where: {
          payment_link,
        },
      },
      body: {
        status,
      },
    });
    await this._msClient.jobDone(job, response);

    await this._msClient.executeJob('order.status.update', {
      payload: {
        order_id: response.data.order_id,
        status: OrderStatus.Ordered,
      },
    });
  }
}
