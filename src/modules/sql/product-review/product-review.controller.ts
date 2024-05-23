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
  ResponseCreated,
  ResponseGetAll,
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
import { Public } from 'src/core/decorators/public.decorator';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { Role } from '../user/role.enum';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewService } from './product-review.service';

const entity = snakeCase(ProductReview.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(ProductReview)
@Controller(entity)
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(ProductReview)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createProductReviewDto: CreateProductReviewDto,
  ) {
    const { error, data } = await this.productReviewService.$db.findOrCreate({
      owner,
      action: 'create',
      body: createProductReviewDto,
      options: {
        where: {
          order_id: createProductReviewDto.order_id,
          product_id: createProductReviewDto.product_id,
          created_by: owner.id,
        },
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
   * Update an entity document by using id
   */
  @Put(':id')
  @ApiOperation({ summary: `Update ${entity} using id` })
  @ResponseUpdated(ProductReview)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateProductReviewDto: UpdateProductReviewDto,
  ) {
    const { error, data } = await this.productReviewService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateProductReviewDto,
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
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(ProductReview)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.productReviewService.findAll({
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
  @Public()
  @Get('product/:product_id')
  @ApiOperation({
    summary: `Get all ${pluralizeString(entity)} against product`,
  })
  @ApiQueryGetAll()
  @ResponseGetAll(ProductReview)
  async findAllAgainstProduct(
    @Res() res: Response,
    @Param('product_id') product_id: number,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.productReviewService.findAll({
        action: 'findAll',
        payload: { ...query, where: { ...query.where, product_id } },
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
