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
  // @Cron('52 14 * * *')
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
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
  // Reorder notification cron
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async reorderNotificationCron() {
    if (this.configService.get('appId') != 'crons') {
      return;
    }
    this.logger.log('Reorder notification cron started...');
    const { error } = await this._orderService.reorderNotificationCron();
    if (error) {
      this.logger.error(`Error - ${error.message || error}`);
      return;
    }
    this.logger.log(`Reorder notification cron completed successfully!`);
  }

  // Track shipment cron
  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async trackShipmentCron() {
  //   if (this.configService.get('appId') != 'crons') {
  //     return;
  //   }
  //   this.logger.log('Shipment tracking cron started...');
  //   const { error } = await this._orderService.trackShipmentCron();
  //   if (error) {
  //     this.logger.error(`Error - ${error.message || error}`);
  //     return;
  //   }
  //   this.logger.log(`Shipment tracking cron completed successfully!`);
  // }

  //payment reminder cron
  // @Cron(CronExpression.EVERY_MINUTE)
  // async paymentReminderCron() {
  //   if (this.configService.get('appId') != 'crons') {
  //     return;
  //   }
  //   this.logger.log('Payment reminder cron started...');
  //   const { error } = await this._orderService.paymentReminderCron();
  //   if (error) {
  //     this.logger.error(`Error - ${error.message || error}`);
  //     return;
  //   }
  //   this.logger.log(`Payment reminder cron completed successfully!`);
  // }
  //payment reminder final cron
  // @Cron(CronExpression.EVERY_MINUTE)
  // async paymentReminderFinalCron() {
  //   if (this.configService.get('appId') != 'crons') {
  //     return;
  //   }
  //   this.logger.log('Payment reminder final cron started...');
  //   const { error } = await this._orderService.paymentReminderFinalCron();
  //   if (error) {
  //     this.logger.error(`Error - ${error.message || error}`);
  //     return;
  //   }
  //   this.logger.log(`Payment reminder final cron completed successfully!`);
  // }

  // order cancel cron
  // @Cron(CronExpression.EVERY_MINUTE)
  // async orderCancelCron() {
  //   if (this.configService.get('appId') != 'crons') {
  //     return;
  //   }
  //   this.logger.log('Order cancel cron started...');
  //   const { error } = await this._orderService.orderCancelCron();
  //   if (error) {
  //     this.logger.error(`Error - ${error.message || error}`);
  //     return;
  //   }
  //   this.logger.log(`Order cancel cron completed successfully!`);
  // }
}
