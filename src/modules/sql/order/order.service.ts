import { ModelService, SqlService } from '@core/sql';
import { StripeService } from '@core/stripe';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Job, JobResponse } from 'src/core/core.job';
import { OrderAddressService } from '../order-address/order-address.service';
import { OrderItemService } from '../order-item/order-item.service';
import { Order } from './entities/order.entity';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrderService extends ModelService<Order> {
  constructor(
    db: SqlService<Order>,
    private _orderAddressService: OrderAddressService,
    private _orderItemService: OrderItemService,
    private _sequelize: Sequelize,
    private _stripeService: StripeService,
  ) {
    super(db);
  }

  async orderCreate(job: Job): Promise<JobResponse> {
    const transaction = await this._sequelize.transaction();
    try {
      const { body } = job.payload;

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

      const items = body.items;

      for await (const item of items) {
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

      const product = await this._stripeService.stripe.products.create({
        name: order.data.uid,
        metadata: {
          order_id: order.data.id,
        },
      });

      const cents = order.data.total * 100;
      const price = await this._stripeService.stripe.prices.create({
        currency: 'usd',
        unit_amount_decimal: `${cents}`,
        product: product.id,
      });
      console.log(price);
      const paymentLink = await this._stripeService.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
      });

      await transaction.commit();
      return { data: { order: order.data, payment_link: paymentLink.url } };
    } catch (error) {
      await transaction.rollback();
      return { error };
    }
  }

  async webhook(job: Job): Promise<JobResponse> {
    try {
      const { payload } = job;
      console.log(payload.body.data);
      return { data: payload };
    } catch (error) {
      return { error };
    }
  }
}
