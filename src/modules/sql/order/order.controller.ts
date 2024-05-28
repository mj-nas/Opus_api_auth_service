import {
  Body,
  Controller,
  Get,
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
  ApiQueryGetAll,
  ApiQueryGetOne,
  MsEventListener,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
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
import { ReorderDto } from './dto/reorder.dto';
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
      id: order_id,
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
    const { error, data } = await this.orderService.createOrder({
      owner,
      action: 'createOrder',
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
   * Reorder order with repeating days
   */
  @Put('reorder/:order_id')
  @ApiOperation({ summary: `Reorder order with repeating days` })
  @ResponseUpdated(Order)
  async reorder(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('order_id') order_id: number,
    @Body() reorderDto: ReorderDto,
  ) {
    const { error, data } = await this.orderService.reorder({
      owner,
      action: 'reorder',
      payload: {
        ...reorderDto,
        order_id,
      },
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
   * Change reorder cycle
   */
  @Put('cycle-change/:order_id')
  @ApiOperation({ summary: `Change reorder cycle` })
  @ResponseUpdated(Order)
  async reorderCycleChange(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('order_id') order_id: number,
    @Body() reorderDto: ReorderDto,
  ) {
    const { error, data } = await this.orderService.reorder({
      owner,
      action: 'reorderCycleChange',
      payload: {
        ...reorderDto,
        order_id,
      },
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
   * Reorder cron
   */
  // @Public()
  // @Post('cron')
  // @ApiOperation({ summary: `Reorder cron` })
  // async reorderCron(@Res() res: Response) {
  //   const { error, data } = await this.orderService.reorderCron();

  //   if (error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Created(res, { data: { [entity]: data }, message: 'Created' });
  // }

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
   * Return all entity documents list by me
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
  @Get(':uid')
  @ApiOperation({ summary: `Find ${entity} using id` })
  @ApiQueryGetOne()
  @ResponseGetOne(Order)
  async findByUid(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('uid') uid: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.orderService.findOne({
      owner,
      action: 'findByUid',
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
}
