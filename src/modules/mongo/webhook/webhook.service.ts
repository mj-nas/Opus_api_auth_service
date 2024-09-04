import {
  ModelService,
  MongoCreateResponse,
  MongoJob,
  MongoService,
} from '@core/mongo';
import { StripeService } from '@core/stripe';
import { Injectable } from '@nestjs/common';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { PaymentStatus } from 'src/modules/sql/order-payment/payment-status.enum';
import { OrderService } from 'src/modules/sql/order/order.service';
import { Webhook } from './entities/webhook.entity';
import { WebhookStatus } from './webhook-status.enum';

@Injectable()
export class WebhookService extends ModelService<Webhook> {
  constructor(
    db: MongoService<Webhook>,
    private _stripeService: StripeService,
    private _msClient: MsClientService,
    private _orderService: OrderService,
  ) {
    super(db);
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: MongoJob<Webhook>): Promise<void> {
    super.doBeforeCreate(job);
    job.body.action = job.action;
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: MongoJob<Webhook>,
    response: MongoCreateResponse<Webhook>,
  ): Promise<void> {
    super.doAfterCreate(job, response);

    switch (response.data.action) {
      case 'checkout.session.completed':
        const paymentSuccess = response.data.payload.data.object;
        await this._msClient.executeJob('payment.status.update', {
          payload: {
            payment_link: paymentSuccess.payment_link,
            status: PaymentStatus.Completed,
          },
        });
        response.data.set('status', WebhookStatus.Completed);
        await response.data.save();
        break;
      case 'xps.order.update':
        const { data, error } = await this._orderService.retrieveOrderNumber({
          uid: response.data.payload.orderId,
        });
        if (error) {
          response.data.set('status', WebhookStatus.Errored);
          await response.data.save();
          throw new Error('Order Could not be Updated');
        }
        response.data.set('status', WebhookStatus.Completed);
        await response.data.save();
        break;
      default:
        break;
    }
  }
}
