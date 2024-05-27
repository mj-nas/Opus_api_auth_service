import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderService } from 'src/modules/sql/order/order.service';

@Injectable()
export class OrderCron {
  private logger: Logger = new Logger(`Cron - Order Service`);
  constructor(private _orderService: OrderService) {}

  // Reorder order
  @Cron('0 0 12 * * *')
  async deleteExpiredOrder() {
    this.logger.log('Reorder order cron started...');
    const { error } = await this._orderService.reorderCron();
    if (error) {
      this.logger.error(`Error - ${error.message || error}`);
      return;
    }
    this.logger.log(`Reorder order cron completed successfully!`);
  }
}
