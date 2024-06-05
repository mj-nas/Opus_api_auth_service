import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  ApiErrorResponses,
  ApiQueryDelete,
  ApiQueryGetAll,
  ResponseCreated,
  ResponseDeleted,
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
import { BulkUpdateProductSortDto } from './dto/bulk-update-product-sort';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategory } from './entities/product-category.entity';
import { ProductCategoryService } from './product-category.service';

const entity = snakeCase(ProductCategory.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(ProductCategory)
@Controller(entity)
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  /**
   * Create a new entity document
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(ProductCategory)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createProductCategoryDto: CreateProductCategoryDto,
  ) {
    const { error, data } = await this.productCategoryService.create({
      owner,
      action: 'create',
      body: createProductCategoryDto,
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
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Update ${entity} using id` })
  @ResponseUpdated(ProductCategory)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    const { error, data } = await this.productCategoryService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateProductCategoryDto,
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
   * Update an entity document by using id
   */
  @Post('bulk-update-sort')
  @Roles(Role.Admin)
  @ApiExtraModels(BulkUpdateProductSortDto)
  @ApiOperation({ summary: 'Update bulk sort by id' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(BulkUpdateProductSortDto),
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            settings: {
              type: 'array',
              items: {
                $ref: getSchemaPath(ProductCategory),
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'Updated',
        },
      },
    },
  })
  async bulkUpdateStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body(new ParseArrayPipe({ items: BulkUpdateProductSortDto }))
    bulkUpdateProductSortDto: BulkUpdateProductSortDto[],
  ) {
    const { error, data } = await this.productCategoryService.updateBulk({
      owner,
      action: 'updateBulk',
      records: bulkUpdateProductSortDto,
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: data, message: 'Updated' });
  }

  /**
   * Return all entity documents list
   */
  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(ProductCategory)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.productCategoryService.findAll({
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
  @Get('public')
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(ProductCategory)
  async publicFindAll(@Res() res: Response, @Query() query: any) {
    const { error, data, offset, limit, count } =
      await this.productCategoryService.findAll({
        action: 'publicFindAll',
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
   * Return all entity documents list for home page
   */
  @Public()
  @Get('home-category-list')
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ResponseGetAll(ProductCategory)
  async getHomeCategoryList(@Res() res: Response) {
    const { error, data } =
      await this.productCategoryService.getHomeCategoryList();

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { [pluralizeString(entity)]: data },
      message: 'Ok',
    });
  }

  /**
   * Return all entity documents list for home page
   */
  @Public()
  @Get('footer-category-list')
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ResponseGetAll(ProductCategory)
  async getFooterCategoryList(@Res() res: Response) {
    const { error, data } =
      await this.productCategoryService.getFooterCategoryList();

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { [pluralizeString(entity)]: data },
      message: 'Ok',
    });
  }

  /**
   * Delete an entity document by using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Delete ${entity} using id` })
  @ApiQueryDelete()
  @ResponseDeleted(ProductCategory)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.productCategoryService.delete({
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
