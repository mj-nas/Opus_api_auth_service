import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CommissionService } from 'src/modules/sql/commission/commission.service';

@Injectable()
export class CommissionCron {
  private logger: Logger = new Logger(`Cron - Commission Service`);
  constructor(
    private _commissionService: CommissionService,
    private configService: ConfigService,
  ) {}

  // Commission Calculator
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @Cron('02 15 * * *')
  async commissionCalculatorCron() {
    if (this.configService.get('appId') != 'crons') {
      return;
    }
    this.logger.log('Commission calculator cron started...');
    const { error } = await this._commissionService.commissionCalculatorCron();
    if (error) {
      this.logger.error(`Error - ${error.message || error}`);
      return;
    }
    this.logger.log(`Commission calculator cron completed successfully!`);
  }
}
