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
import { Wishlist } from './entities/wishlist.entity';
import { WishlistService } from './wishlist.service';

const entity = snakeCase(Wishlist.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(Wishlist)
@Controller(entity)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Create a new entity document
   */
  @Post(':product_id')
  @ApiOperation({ summary: `Add or Remove from ${entity}` })
  @ResponseCreated(Wishlist)
  async addOrRemove(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('product_id') product_id: number,
  ) {
    const { error, data, message } = await this.wishlistService.addOrRemove({
      owner,
      action: 'create',
      payload: { product_id },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data, message });
  }

  /**
   * Return all entity documents list
   */
  @Get()
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(Wishlist)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.wishlistService.findAll({
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
