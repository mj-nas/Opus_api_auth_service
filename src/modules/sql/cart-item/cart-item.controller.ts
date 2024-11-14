import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  ApiErrorResponses,
  ApiQueryDelete,
  ApiQueryGetOne,
  ResponseCreated,
  ResponseDeleted,
  ResponseUpdated,
} from 'src/core/core.decorators';
import { NotFoundError } from 'src/core/core.errors';
import {
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';

const entity = snakeCase(CartItem.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(CartItem)
@Controller(entity)
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  @ApiQueryGetOne()
  @ResponseCreated(CartItem)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    const { error, data } = await this.cartItemService.create({
      owner,
      action: 'create',
      body: createCartItemDto,
      payload: { ...query },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { [entity]: data }, message: 'Created' });
  }

  /**
   * Update an entity document by using id
   */
  @Put(':id')
  @ApiOperation({ summary: `Update ${entity} using id` })
  @ApiQueryGetOne()
  @ResponseUpdated(CartItem)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const { error, data } = await this.cartItemService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateCartItemDto,
      payload: { ...query },
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
    return Result(res, { data: { [entity]: data }, message: 'Updated' });
  }

  /**
   * Delete an entity document by using id
   */
  @Delete(':id')
  @ApiOperation({ summary: `Delete ${entity} using id` })
  @ApiQueryDelete()
  @ResponseDeleted(CartItem)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.cartItemService.delete({
      owner,
      action: 'delete',
      id: +id,
      payload: { ...query },
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
    return Result(res, { data: { [entity]: data }, message: 'Deleted' });
  }
}
