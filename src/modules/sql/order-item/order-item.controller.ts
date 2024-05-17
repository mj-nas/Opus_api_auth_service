import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { snakeCase } from 'src/core/core.utils';
import { OrderItem } from './entities/order-item.entity';

const entity = snakeCase(OrderItem.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderItem)
@Controller(entity)
export class OrderItemController {
  constructor() {}
}
