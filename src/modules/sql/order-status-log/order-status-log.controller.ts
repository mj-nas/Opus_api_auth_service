import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses, MsEventListener } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { snakeCase } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderStatusLog } from './entities/order-status-log.entity';
import { OrderStatusLogService } from './order-status-log.service';

const entity = snakeCase(OrderStatusLog.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderStatusLog)
@Controller(entity)
export class OrderStatusLogController {
  constructor(
    private readonly orderStatusLogService: OrderStatusLogService,
    private _msClient: MsClientService,
  ) {}

  /**
   * Queue listener for order status log create
   */
  @MsEventListener('order-status-log.create')
  async userListener(job: Job): Promise<void> {
    const { order_id, status } = job.payload;
    const response = await this.orderStatusLogService.create({
      action: 'order-status-log.create',
      body: {
        order_id,
        status,
      },
    });
    await this._msClient.jobDone(job, response);
  }
}
