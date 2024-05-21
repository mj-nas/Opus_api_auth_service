import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { snakeCase } from 'src/core/core.utils';
import { OrderPayment } from './entities/order-payment.entity';

const entity = snakeCase(OrderPayment.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderPayment)
@Controller(entity)
export class OrderPaymentController {
  constructor() {}
}
