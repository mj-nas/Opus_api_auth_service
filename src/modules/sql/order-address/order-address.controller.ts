import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses, MsEventListener } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { snakeCase } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OrderAddress } from './entities/order-address.entity';
import { OrderAddressService } from './order-address.service';

const entity = snakeCase(OrderAddress.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderAddress)
@Controller(entity)
export class OrderAddressController {
  constructor(
    private readonly orderAddressService: OrderAddressService,
    private client: MsClientService,
  ) {}

  /**
   * Queue listener for User Update
   */
  @MsEventListener('order.create')
  async orderCreateListener(job: Job): Promise<void> {
    const {} = job.payload;
    const response = await this.orderAddressService.create({});
    await this.client.jobDoneMulti(job, response);
  }
}
