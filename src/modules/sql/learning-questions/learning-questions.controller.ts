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
import { LearningQuestionsService } from './learning-questions.service';
import { CreateLearningQuestionsDto } from './dto/create-learning-questions.dto';
import { UpdateLearningQuestionsDto } from './dto/update-learning-questions.dto';
import { LearningQuestions } from './entities/learning-questions.entity';

const entity = snakeCase(LearningQuestions.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(LearningQuestions)
@Controller(entity)
export class LearningQuestionsController {
  constructor(private readonly learningQuestionsService: LearningQuestionsService) {}

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(LearningQuestions)
  async create(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createLearningQuestionsDto: CreateLearningQuestionsDto,
  ) {
    const { error, data } = await this.learningQuestionsService.create({
      owner,
      action: 'create',
      body: createLearningQuestionsDto,
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
  @ResponseUpdated(LearningQuestions)
  async update(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateLearningQuestionsDto: UpdateLearningQuestionsDto,
  ) {
    const { error, data } = await this.learningQuestionsService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateLearningQuestionsDto,
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
  @ResponseGetAll(LearningQuestions)
  async findAll(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.learningQuestionsService.findAll({
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
    const { error, count } = await this.learningQuestionsService.getCount({
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
  @ResponseGetOne(LearningQuestions)
  async findOne(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.learningQuestionsService.findOne({
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
  @ResponseGetOne(LearningQuestions)
  async findById(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.learningQuestionsService.findById({
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
  @ResponseDeleted(LearningQuestions)
  async delete(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.learningQuestionsService.delete({
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
