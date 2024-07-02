import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/core/core.decorators';
import { snakeCase } from 'src/core/core.utils';
import { CouponUsed } from './entities/coupon-used.entity';

const entity = snakeCase(CouponUsed.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(CouponUsed)
@Controller(entity)
export class CouponUsedController {}
