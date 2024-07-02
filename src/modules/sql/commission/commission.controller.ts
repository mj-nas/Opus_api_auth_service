import { Body, Controller, Get, Param, Put, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  ApiErrorResponses,
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
} from 'src/core/core.decorators';
import { NotFoundError } from 'src/core/core.errors';
import { ErrorResponse, NotFound, Result } from 'src/core/core.responses';
import { pluralizeString, snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { Role } from '../user/role.enum';
import { CommissionService } from './commission.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { Commission } from './entities/commission.entity';

const entity = snakeCase(Commission.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(Commission)
@Controller(entity)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  /**
   * Reorder cron
   */
  // @Public()
  // @Post('commission-calculator')
  // @ApiOperation({ summary: `Commission calculator` })
  // async commissionCalculator(@Res() res: Response) {
  //   const { error, data } =
  //     await this.commissionService.commissionCalculatorCron();

  //   if (error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Created(res, { data: { [entity]: data }, message: 'Created' });
  // }

  /**
   * Update an entity document by using id
   */
  @Put(':id')
  @ApiOperation({ summary: `Update ${entity} using id` })
  @ResponseUpdated(Commission)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateCommissionDto: UpdateCommissionDto,
  ) {
    const { error, data } = await this.commissionService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateCommissionDto,
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
  @ResponseGetAll(Commission)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.commissionService.findAll({
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

    const { error: countError, data: countData } =
      await this.commissionService.getAllCounts({
        owner,
        action: 'findAll',
        payload: { ...query },
      });
    if (countError) {
      return ErrorResponse(res, {
        error: countError,
        message: `${countError.message || countError}`,
      });
    }
    return Result(res, {
      data: {
        [pluralizeString(entity)]: data,
        quick_stats: countData,
        offset,
        limit,
        count,
      },
      message: 'Ok',
    });
  }

  /**
   * Return all entity documents list
   */
  @Get('me')
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(Commission)
  async findAllMe(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.commissionService.findAll({
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

    const { error: countError, data: countData } =
      await this.commissionService.getAllCounts({
        owner,
        action: 'findAllMe',
        payload: { ...query },
      });
    if (countError) {
      return ErrorResponse(res, {
        error: countError,
        message: `${countError.message || countError}`,
      });
    }
    return Result(res, {
      data: {
        [pluralizeString(entity)]: data,
        quick_stats: countData,
        offset,
        limit,
        count,
      },
      message: 'Ok',
    });
  }

  /**
   * Find one entity document
   */
  @Get('find')
  @ApiOperation({ summary: `Find one ${entity}` })
  @ApiQueryGetOne()
  @ResponseGetOne(Commission)
  async findOne(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.commissionService.findOne({
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
   * Return all entity documents list
   */
  @Get('commision-export-xls')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Create ${pluralizeString('Commision')} xls` })
  @ApiQueryGetAll()
  @ApiOkResponse({
    description: 'xls file created',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
          },
        },
        message: {
          type: 'string',
          example: 'xls file created',
        },
      },
    },
  })
  async exportXls(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.commissionService.createCommissionXls({
      owner,
      action: 'createXls',
      payload: { ...query },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { ...data },
      message: 'Ok',
    });
  }

  /**
   * Get an entity document by using id
   */
  @Get(':id')
  @ApiOperation({ summary: `Find ${entity} using id` })
  @ApiQueryGetById()
  @ResponseGetOne(Commission)
  async findById(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.commissionService.findById({
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
}
