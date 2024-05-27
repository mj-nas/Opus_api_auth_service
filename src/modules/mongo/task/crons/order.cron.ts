import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from 'src/modules/sql/order/order.service';

@Injectable()
export class OrderCron {
  private logger: Logger = new Logger(`Cron - Order Service`);
  constructor(private _orderService: OrderService) {}

  // Reorder order
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
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
