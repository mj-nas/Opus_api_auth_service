import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses, MsEventListener } from 'src/core/core.decorators';
import { Job } from 'src/core/core.job';
import { snakeCase } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { UserDispenser } from './entities/user-dispenser.entity';
import { UserDispenserService } from './user-dispenser.service';

const entity = snakeCase(UserDispenser.name);

@ApiTags(entity)
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(UserDispenser)
@Controller(entity)
export class UserDispenserController {
  constructor(
    private readonly userDispenserService: UserDispenserService,
    private _msClient: MsClientService,
  ) {}

  /**
   * Queue listener for user-dispenser log creation
   */
  @MsEventListener('user.dispenser.change')
  async userDispenserLogListener(job: Job): Promise<void> {
    const response = await this.userDispenserService.create({
      owner: job.owner,
      action: 'create',
      body: job.payload,
    });
    await this._msClient.jobDone(job, response);
  }

  // /**
  //  * Create a new entity document
  //  */
  // @Post()
  // @ApiOperation({ summary: `Create new ${entity}` })
  // @ResponseCreated(UserDispenser)
  // async create(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Body() createUserDispenserDto: CreateUserDispenserDto,
  // ) {
  //   const { error, data } = await this.userDispenserService.create({
  //     owner,
  //     action: 'create',
  //     body: createUserDispenserDto,
  //   });

  //   if (error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Created(res, { data: { [entity]: data }, message: 'Created' });
  // }

  // /**
  //  * Update an entity document by using id
  //  */
  // @Put(':id')
  // @ApiOperation({ summary: `Update ${entity} using id` })
  // @ResponseUpdated(UserDispenser)
  // async update(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Param('id') id: number,
  //   @Body() updateUserDispenserDto: UpdateUserDispenserDto,
  // ) {
  //   const { error, data } = await this.userDispenserService.update({
  //     owner,
  //     action: 'update',
  //     id: +id,
  //     body: updateUserDispenserDto,
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

  // /**
  //  * Return all entity documents list
  //  */
  // @Get()
  // @ApiOperation({ summary: `Get all ${pluralizeString(entity)}` })
  // @ApiQueryGetAll()
  // @ResponseGetAll(UserDispenser)
  // async findAll(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Query() query: any,
  // ) {
  //   const { error, data, offset, limit, count } =
  //     await this.userDispenserService.findAll({
  //       owner,
  //       action: 'findAll',
  //       payload: { ...query },
  //     });

  //   if (error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Result(res, {
  //     data: { [pluralizeString(entity)]: data, offset, limit, count },
  //     message: 'Ok',
  //   });
  // }

  // /**
  //  * Return count of entity documents
  //  */
  // @Get('count')
  // @ApiOperation({ summary: `Get count of ${pluralizeString(entity)}` })
  // @ApiQueryCountAll()
  // @ResponseCountAll()
  // async countAll(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Query() query: any,
  // ) {
  //   const { error, count } = await this.userDispenserService.getCount({
  //     owner,
  //     action: 'getCount',
  //     payload: { ...query },
  //   });

  //   if (!!error) {
  //     return ErrorResponse(res, {
  //       error,
  //       message: `${error.message || error}`,
  //     });
  //   }
  //   return Result(res, {
  //     data: { count },
  //     message: 'Ok',
  //   });
  // }

  // /**
  //  * Find one entity document
  //  */
  // @Get('find')
  // @ApiOperation({ summary: `Find one ${entity}` })
  // @ApiQueryGetOne()
  // @ResponseGetOne(UserDispenser)
  // async findOne(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Query() query: any,
  // ) {
  //   const { error, data } = await this.userDispenserService.findOne({
  //     owner,
  //     action: 'findOne',
  //     payload: { ...query },
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
  //   return Result(res, { data: { [entity]: data }, message: 'Ok' });
  // }

  // /**
  //  * Get an entity document by using id
  //  */
  // @Get(':id')
  // @ApiOperation({ summary: `Find ${entity} using id` })
  // @ApiQueryGetById()
  // @ResponseGetOne(UserDispenser)
  // async findById(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Param('id') id: number,
  //   @Query() query: any,
  // ) {
  //   const { error, data } = await this.userDispenserService.findById({
  //     owner,
  //     action: 'findById',
  //     id: +id,
  //     payload: { ...query },
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
  //   return Result(res, { data: { [entity]: data }, message: 'Ok' });
  // }

  // /**
  //  * Delete an entity document by using id
  //  */
  // @Delete(':id')
  // @ApiOperation({ summary: `Delete ${entity} using id` })
  // @ApiQueryDelete()
  // @ResponseDeleted(UserDispenser)
  // async delete(
  //   @Res() res: Response,
  //   @Owner() owner: OwnerDto,
  //   @Param('id') id: number,
  //   @Query() query: any,
  // ) {
  //   const { error, data } = await this.userDispenserService.delete({
  //     owner,
  //     action: 'delete',
  //     id: +id,
  //     payload: { ...query },
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
  //   return Result(res, { data: { [entity]: data }, message: 'Deleted' });
  // }
}
