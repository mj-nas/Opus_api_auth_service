import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderItem, OrderItemStatus } from './entities/order-item.entity';

@Injectable()
export class OrderItemService extends ModelService<OrderItem> {
  constructor(
    db: SqlService<OrderItem>,
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
    job: SqlJob<OrderItem>,
    response: SqlUpdateResponse<OrderItem>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    const { status } = response.data;
    const { status: previousStatus } = response.previousData;
    if (previousStatus !== status && status === OrderItemStatus.Returned) {
      await this._msClient.executeJob('order-item.status.update', {
        payload: {
          order_id: response.data.order_id,
        },
      });
    }
  }
}
