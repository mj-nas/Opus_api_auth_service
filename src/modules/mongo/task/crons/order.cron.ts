import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from 'src/modules/sql/order/order.service';

@Injectable()
export class OrderCron {
  private logger: Logger = new Logger(`Cron - Order Service`);
  constructor(
    private _orderService: OrderService,
    private configService: ConfigService,
  ) {}

  // Reorder order
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async reorderCron() {
    if (this.configService.get('appId') != 'crons') {
      return;
    }
    this.logger.log('Reorder order cron started...');
    const { error } = await this._orderService.reorderCron();
    if (error) {
      this.logger.error(`Error - ${error.message || error}`);
      return;
    }
    this.logger.log(`Reorder order cron completed successfully!`);
  }
}
