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
import { BulkUpdateSortDto } from './dto/bulk-update-sort.dto';
import { CreateLearnArticleDto } from './dto/create-learn-article.dto';
import { UpdateLearnArticleDto } from './dto/update-learn-article.dto';
import { LearnArticle } from './entities/learn-article.entity';
import { LearnArticleService } from './learn-article.service';

const entity = snakeCase(LearnArticle.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(LearnArticle)
@Controller(entity)
export class LearnArticleController {
  constructor(private readonly learnArticleService: LearnArticleService) {}

  /**
   * Create a new entity document
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(LearnArticle)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createLearnArticleDto: CreateLearnArticleDto,
  ) {
    const { error, data } = await this.learnArticleService.create({
      owner,
      action: 'create',
      body: createLearnArticleDto,
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
  @Post('bulk-update-sort')
  @Roles(Role.Admin)
  @ApiExtraModels(BulkUpdateSortDto)
  @ApiOperation({ summary: 'Update bulk sort by id' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(BulkUpdateSortDto),
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
                $ref: getSchemaPath(LearnArticle),
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
    @Body(new ParseArrayPipe({ items: BulkUpdateSortDto }))
    bulkUpdateSortDto: BulkUpdateSortDto[],
  ) {
    const { error, data } = await this.learnArticleService.updateBulk({
      owner,
      action: 'updateBulk',
      records: bulkUpdateSortDto,
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
   * Update an entity document by using id
   */
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Update ${entity} using id` })
  @ResponseUpdated(LearnArticle)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateLearnArticleDto: UpdateLearnArticleDto,
  ) {
    const { error, data } = await this.learnArticleService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateLearnArticleDto,
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
  @Public()
  @Get()
  @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  @ApiQueryGetAll()
  @ResponseGetAll(LearnArticle)
  async findAll(@Res() res: Response, @Query() query: any) {
    const { error, data, offset, limit, count } =
      await this.learnArticleService.findAll({
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
   * Delete an entity document by using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Delete ${entity} using id` })
  @ApiQueryDelete()
  @ResponseDeleted(LearnArticle)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.learnArticleService.delete({
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
