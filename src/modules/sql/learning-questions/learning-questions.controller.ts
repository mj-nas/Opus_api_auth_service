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
import { LearningQuestionOptionsService } from '../learning-question-options/learning-question-options.service';
import { CreateLearningQuestionsOptionsDto } from './dto/create-learning-questions-options.dto';
import { LearningQuestions } from './entities/learning-questions.entity';
import { LearningQuestionsService } from './learning-questions.service';

const entity = snakeCase(LearningQuestions.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(LearningQuestions)
@Controller(entity)
export class LearningQuestionsController {
  constructor(
    private readonly learningQuestionsService: LearningQuestionsService,
    private optionsService: LearningQuestionOptionsService,
  ) {}

  // /**
  //  * Create a new entity document
  //  */
  // @Post()
  // @ApiOperation({ summary: `Create new ${entity}` })
  // @ResponseCreated(LearningQuestions)
  // async create(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Body() createLearningQuestionsDto: CreateLearningQuestionsDto,
  // ) {
  //   const { error, data } = await this.learningQuestionsService.create({
  //     owner,
  //     action: 'create',
  //     body: createLearningQuestionsDto,
  //   });

  //   if (error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Created(res, { data: { [entity]: data }, message: 'Created' });
  // }

  /**
   * Create a new entity document
   */
  @Post()
  @ApiOperation({ summary: `Create new ${entity}` })
  @ResponseCreated(LearningQuestions)
  async createWithOptions(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body()
    createLearningQuestionsOptionsDto: CreateLearningQuestionsOptionsDto,
  ) {
    const { options, ...question } = createLearningQuestionsOptionsDto;
    const { error, data } = await this.learningQuestionsService.create({
      owner,
      action: 'create',
      body: question,
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    console.log(createLearningQuestionsOptionsDto);
    console.log(options);
    console.log(question);

    const { data: option, error: options_error } =
      await this.optionsService.$db.createBulkRecords({
        owner,
        action: 'createBulkRecords',
        records: options.map((option) => ({
          ...option,
          question_id: data.id,
        })),
      });

    if (options_error) {
      return ErrorResponse(res, {
        error: options_error,
        message: `${options_error.message || options_error}`,
      });
    }

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, {
      data: { [entity]: { ...data.dataValues, option } },
      message: 'Created',
    });
  }

  /**
   * Update an entity document by using id
   */
  // @Put(':id')
  // @ApiOperation({ summary: `Update ${entity} using id` })
  // @ResponseUpdated(LearningQuestions)
  // async update(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Param('id') id: number,
  //   @Body() updateLearningQuestionsDto: UpdateLearningQuestionsDto,
  // ) {
  //   const { error, data } = await this.learningQuestionsService.update({
  //     owner,
  //     action: 'update',
  //     id: +id,
  //     body: updateLearningQuestionsDto,
  //   });

  //   if (error) {
  //     if (error instanceof NotFoundError) {
  //       return NotFound(res, {
  //         error,
  //         message: `Record not found`,
  //       });
  //     }
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Result(res, { data: { [entity]: data }, message: 'Updated' });
  // }
  @Put(':id')
  @ApiOperation({ summary: `Update ${entity} and options using id` })
  @ResponseUpdated(CreateLearningQuestionsOptionsDto)
  async updateWithOptions(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() body: CreateLearningQuestionsOptionsDto,
  ) {
    const { options, ...question } = body;
    const { error, data } = await this.learningQuestionsService.update({
      owner,
      action: 'update',
      id: +id,
      body: question,
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

    //deletes all options with the question_id
    const { error: delete_options_error } =
      await this.optionsService.$db.deleteBulkRecords({
        owner,
        action: 'deleteRecords',
        options: {
          where: { question_id: data.id },
          paranoid: false,
        },
      });
    if (delete_options_error) {
      return ErrorResponse(res, {
        error: delete_options_error,
        message: `${delete_options_error.message || delete_options_error}`,
      });
    }

    // creates another set of options with the question_id
    const { data: option, error: options_error } =
      await this.optionsService.$db.createBulkRecords({
        owner,
        action: 'createBulkRecords',
        records: options.map((option) => ({
          ...option,
          question_id: data.id,
        })),
      });

    if (options_error) {
      return ErrorResponse(res, {
        error: options_error,
        message: `${options_error.message || options_error}`,
      });
    }
    return Result(res, {
      data: { [entity]: { ...data.dataValues, option } },
      message: 'Updated',
    });
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
