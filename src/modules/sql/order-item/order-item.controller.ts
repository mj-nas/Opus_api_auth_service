import { Body, Controller, Param, Put, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ApiErrorResponses, ResponseUpdated } from 'src/core/core.decorators';
import { NotFoundError } from 'src/core/core.errors';
import { ErrorResponse, NotFound, Result } from 'src/core/core.responses';
import { snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemService } from './order-item.service';

const entity = snakeCase(OrderItem.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(OrderItem)
@Controller(entity)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  /**
   * Update an OrderItem using id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a setting using id' })
  @ResponseUpdated(OrderItem)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    const { error, data } = await this.orderItemService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateOrderItemDto,
    });

    if (error) {
      if (error instanceof NotFoundError) {
        return NotFound(res, {
          error,
          message: `Record not found`,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: { OrderItem: data }, message: 'Updated' });
  }
}
