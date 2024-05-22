import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { StripeService } from '@core/stripe';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderAddressService } from '../order-address/order-address.service';
import { OrderItemService } from '../order-item/order-item.service';
import { OrderPaymentService } from '../order-payment/order-payment.service';
import { OrderStatusLogService } from '../order-status-log/order-status-log.service';
import { Order } from './entities/order.entity';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrderService extends ModelService<Order> {
  constructor(
    db: SqlService<Order>,
    private _orderAddressService: OrderAddressService,
    private _orderItemService: OrderItemService,
    private _orderStatusLogService: OrderStatusLogService,
    private _orderPaymentService: OrderPaymentService,
    private _sequelize: Sequelize,
    private _stripeService: StripeService,
    private _msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<Order>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doBeforeFind
   * @function function will execute before findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFind(job: SqlJob<Order>): Promise<void> {
    await super.doBeforeFind(job);
    if (job.action === 'findOneMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<Order>,
    response: SqlUpdateResponse<Order>,
  ): Promise<void> {
    if (job.action === 'order.status.update') {
      await this._msClient.executeJob('order-status-log.create', {
        payload: {
          order_id: response.data.id,
          status: response.data.status,
        },
      });
    }
  }

  async orderCreate(job: Job): Promise<JobResponse> {
    const transaction = await this._sequelize.transaction();
    try {
      const { body } = job.payload;

      // Create a new order
      const order = await this.create({
        owner: job.owner,
        action: 'create',
        body: {
          ...body,
          user_id: job.owner.id,
          is_base_order: body.is_repeating_order === 'Y' ? 'Y' : 'N',
          status: OrderStatus.PaymentPending,
        },
        options: {
          transaction,
        },
      });
      if (!!order.error) {
        await transaction.rollback();
        return { error: order.error };
      }

      // Create a new order address
      const address = await this._orderAddressService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          ...body.address,
        },
        options: {
          transaction,
        },
      });
      if (!!address.error) {
        await transaction.rollback();
        return { error: address.error };
      }

      // Loop through the products
      const items = body.items;
      for await (const item of items) {
        // Create a order product
        const itemCreate = await this._orderItemService.create({
          owner: job.owner,
          action: 'create',
          body: {
            order_id: order.data.id,
            ...item,
          },
          options: {
            transaction,
          },
        });
        if (!!itemCreate.error) {
          await transaction.rollback();
          return { error: itemCreate.error };
        }
      }

      // Create order status log
      const status = await this._orderStatusLogService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          status: OrderStatus.PaymentPending,
        },
        options: {
          transaction,
        },
      });
      if (!!status.error) {
        await transaction.rollback();
        return { error: status.error };
      }

      // Create a new stripe product against the order
      const product = await this._stripeService.stripe.products.create({
        name: order.data.uid,
        metadata: {
          order_id: order.data.id,
        },
      });

      // Create a new stripe price for the order
      const cents = order.data.total * 100;
      const price = await this._stripeService.stripe.prices.create({
        currency: 'usd',
        unit_amount_decimal: `${cents}`,
        product: product.id,
      });

      // Create a stripe payment link for the order
      const paymentLink = await this._stripeService.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
      });

      // Create order payment
      const payment = await this._orderPaymentService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          payment_link: paymentLink.id,
          payment_link_url: paymentLink.url,
        },
        options: {
          transaction,
        },
      });
      if (!!payment.error) {
        await transaction.rollback();
        return { error: payment.error };
      }

      await transaction.commit();
      return { data: { order: order.data, payment_link: paymentLink.url } };
    } catch (error) {
      await transaction.rollback();
      return { error };
    }
  }
}
