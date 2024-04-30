import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
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
  ResponseCreated,
  ResponseGetAll,
} from 'src/core/core.decorators';
import { Created, ErrorResponse, Result } from 'src/core/core.responses';
import { pluralizeString, snakeCase } from 'src/core/core.utils';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { RecentlyViewed } from './entities/recently-viewed.entity';
import { RecentlyViewedService } from './recently-viewed.service';

const entity = snakeCase(RecentlyViewed.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(RecentlyViewed)
@Controller(entity)
export class RecentlyViewedController {
  constructor(private readonly recentlyViewedService: RecentlyViewedService) {}

  /**
   * Create a new entity document
   */
  @Post(':product_id')
  @ApiOperation({ summary: `Add or Remove from ${entity}` })
  @ResponseCreated(RecentlyViewed)
  async addOrRemove(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('product_id') product_id: number,
  ) {
    const { error, data } = await this.recentlyViewedService.$db.findOrCreate({
      owner,
      action: 'findOrCreate',
      body: { product_id, user_id: owner.id },
      payload: {
        where: {
          product_id,
          user_id: owner.id,
        },
      },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, {
      data,
      message: 'The product has been viewed successfully.',
    });
  }

  /**
   * Return all entity documents list
   */
  @Get()
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(RecentlyViewed)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.recentlyViewedService.findAll({
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
}
