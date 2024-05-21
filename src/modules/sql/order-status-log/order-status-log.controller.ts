import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { snakeCase } from 'src/core/core.utils';
import { OrderStatusLog } from './entities/order-status-log.entity';

const entity = snakeCase(OrderStatusLog.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderStatusLog)
@Controller(entity)
export class OrderStatusLogController {
  constructor() {}
}
