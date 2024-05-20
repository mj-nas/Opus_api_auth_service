import { ModelService, SqlService } from '@core/sql';
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
  ) {
    super(db);
  }

  async orderCreate(job: Job): Promise<JobResponse> {
    try {
      const { body } = job.payload;
      const transaction = await this._sequelize.transaction();
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

      await transaction.commit();
      return { data: order.data };
    } catch (error) {
      return { error };
    }
  }
}
