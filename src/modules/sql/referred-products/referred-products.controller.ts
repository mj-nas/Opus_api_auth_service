import {
  Body,
  Controller,
  Delete,
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
  ApiQueryCountAll,
  ApiQueryDelete,
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  ResponseCountAll,
  ResponseCreated,
  ResponseDeleted,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
} from 'src/core/core.decorators';
import { NotFoundError } from 'src/core/core.errors';
import {
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { pluralizeString, snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { ReferredProductsService } from './referred-products.service';
import { CreateReferredProductsDto } from './dto/create-referred-products.dto';
import { UpdateReferredProductsDto } from './dto/update-referred-products.dto';
import { ReferredProducts } from './entities/referred-products.entity';

const entity = snakeCase(ReferredProducts.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(ReferredProducts)
@Controller(entity)
export class ReferredProductsController {
  constructor(private readonly referredProductsService: ReferredProductsService) {}

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(ReferredProducts)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createReferredProductsDto: CreateReferredProductsDto,
  ) {
    const { error, data } = await this.referredProductsService.create({
      owner,
      action: 'create',
      body: createReferredProductsDto,
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
  @ResponseUpdated(ReferredProducts)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateReferredProductsDto: UpdateReferredProductsDto,
  ) {
    const { error, data } = await this.referredProductsService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateReferredProductsDto,
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
   * Return all entity documents list
   */
  @Get()
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(ReferredProducts)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.referredProductsService.findAll({
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
   * Return count of entity documents
   */
  @Get('count')
  @ApiOperation({ summary: `Get count of ${pluralizeString(entity)}` })
  @ApiQueryCountAll()
  @ResponseCountAll()
  async countAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, count } = await this.referredProductsService.getCount({
      owner,
      action: 'getCount',
      payload: { ...query },
    });

    if (!!error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { count },
      message: 'Ok',
    });
  }

  /**
   * Find one entity document
   */
  @Get('find')
  @ApiOperation({ summary: `Find one ${entity}` })
  @ApiQueryGetOne()
  @ResponseGetOne(ReferredProducts)
  async findOne(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.referredProductsService.findOne({
      owner,
      action: 'findOne',
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
   * Get an entity document by using id
   */
  @Get(':id')
  @ApiOperation({ summary: `Find ${entity} using id` })
  @ApiQueryGetById()
  @ResponseGetOne(ReferredProducts)
  async findById(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.referredProductsService.findById({
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
  @ResponseDeleted(ReferredProducts)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.referredProductsService.delete({
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
