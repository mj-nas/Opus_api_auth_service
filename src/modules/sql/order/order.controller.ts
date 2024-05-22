import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  MsEventListener,
  ResponseDeleted,
  ResponseGetAll,
  ResponseGetOne,
} from 'src/core/core.decorators';
import { NotFoundError } from 'src/core/core.errors';
import { Job } from 'src/core/core.job';
import {
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { pluralizeString, snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { Role } from '../user/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

const entity = snakeCase(Order.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(Order)
@Controller(entity)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private _msClient: MsClientService,
  ) {}

  /**
   * Queue listener for order status update
   */
  @MsEventListener('order.status.update')
  async userListener(job: Job): Promise<void> {
    const { order_id, status } = job.payload;
    const response = await this.orderService.update({
      action: 'order.status.update',
      options: {
        where: {
          id: order_id,
        },
      },
      body: {
        status,
      },
    });
    await this._msClient.jobDone(job, response);
  }

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const { error, data } = await this.orderService.orderCreate({
      owner,
      action: 'orderCreate',
      payload: {
        body: createOrderDto,
      },
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
   * Return all entity documents list
   */
  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Get my ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(Order)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.orderService.findAll({
        owner,
        action: 'findAll',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { [pluralizeString(entity)]: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all entity documents list
   */
  @Get('me')
  @ApiOperation({ summary: `Get my ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(Order)
  async findAllMe(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.orderService.findAll({
        owner,
        action: 'findAllMe',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { [pluralizeString(entity)]: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one entity document
   */
  @Get('me/:uid')
  @ApiOperation({ summary: `Find my ${entity}` })
  @ApiQueryGetOne()
  @ResponseGetOne(Order)
  async findOneMe(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('uid') uid: string,
    @Query() query: any,
  ) {
    const { error, data } = await this.orderService.findOne({
      owner,
      action: 'findOneMe',
      payload: { ...query, where: { ...query.where, uid } },
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
    return Result(res, { data: { [entity]: data }, message: 'Ok' });
  }

  /**
   * Get an entity document by using id
   */
  @Get(':id')
  @ApiOperation({ summary: `Find ${entity} using id` })
  @ApiQueryGetById()
  @ResponseGetOne(Order)
  async findById(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.orderService.findById({
      owner,
      action: 'findById',
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
    return Result(res, { data: { [entity]: data }, message: 'Ok' });
  }

  /**
   * Delete an entity document by using id
   */
  @Delete(':id')
  @ApiOperation({ summary: `Delete ${entity} using id` })
  @ApiQueryDelete()
  @ResponseDeleted(Order)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.orderService.delete({
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
