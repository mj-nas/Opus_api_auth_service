import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ApiErrorResponses,
  ApiQueryDelete,
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  FileUploads,
  ResponseCreated,
  ResponseDeleted,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
} from 'src/core/core.decorators';
import { QueryPopulate } from 'src/core/core.definitions';
import { NotFoundError, ValidationError } from 'src/core/core.errors';
import {
  BadRequest,
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { pluralizeString } from 'src/core/core.utils';
import { Public } from 'src/core/decorators/public.decorator';
import { OwnerIncludeAttribute } from 'src/core/decorators/sql/owner-attributes.decorator';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { Role } from '../user/role.enum';
import { ChangePasswordByAdminDto } from './dto/change-password-by-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Status } from './status.enum';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth()
@ApiErrorResponses()
@ApiExtraModels(User)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new User
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new user' })
  // @ApiConsumes('application/json', 'multipart/form-data')
  // @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  // @ApiQuery(QueryPopulate)
  @ResponseCreated(User)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createUserDto: CreateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.create({
      owner,
      action: 'create',
      body: createUserDto,
      payload: { ...query },
    });

    if (error) {
      if (error instanceof ValidationError) {
        return BadRequest(res, {
          error,
          message: error.message,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { user: data }, message: 'Created' });
  }

  /**
   * Create a new Dispenser
   */
  @Post('dispenser')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new Dispencer' })
  // @ApiConsumes('application/json', 'multipart/form-data')
  // @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  // @ApiQuery(QueryPopulate)
  @ResponseCreated(User)
  async createDispenser(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createDispenserDto: CreateDispenserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.create({
      owner,
      action: 'createDispenser',
      body: {
        ...createDispenserDto,
        status: Status.Approve,
        role: Role.Dispenser,
      },
      payload: { ...query },
    });

    if (error) {
      if (error instanceof ValidationError) {
        return BadRequest(res, {
          error,
          message: error.message,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { user: data }, message: 'Created' });
  }

  /**
   * Create a new User
   */
  @Post('import')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Import Users' })
  @ApiConsumes('multipart/form-data')
  @FileUploads([{ name: 'csv_file', required: true }])
  @ResponseCreated(User)
  async importExcel(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @UploadedFiles() files: { csv_file: any },
  ) {
    const { error, data } = await this.userService.importExcel({
      owner,
      action: 'importExcel',
      payload: { ...files },
    });

    if (error) {
      if (error instanceof ValidationError) {
        return BadRequest(res, {
          error,
          message: error.message,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data, message: 'Created' });
  }
  /**
   * Create a new Dispenser
   */
  @Post('import/dispenser')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Import Dispensers' })
  @ApiConsumes('multipart/form-data')
  @FileUploads([{ name: 'csv_file', required: true }])
  @ResponseCreated(User)
  async importDispenserExcel(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @UploadedFiles() files: { csv_file: any },
  ) {
    const { error, data } = await this.userService.importDispenserExcel({
      owner,
      action: 'importDispenserExcel',
      payload: { ...files },
    });

    if (error) {
      if (error instanceof ValidationError) {
        return BadRequest(res, {
          error,
          message: error.message,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data, message: 'Created' });
  }

  /**
   * Reorder cron
   */
  @Post('qr-code')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `QR Code Testing API` })
  async createQRCode(@Res() res: Response) {
    const { error, data } = await this.userService.createQRCode({
      payload: {
        user_id: 1,
      },
    });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data, message: 'Created' });
  }

  /**
   * Update logged in user details
   */
  @Put('me')
  @ApiOperation({ summary: 'Update logged in user details' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  @ApiQuery(QueryPopulate)
  @ResponseUpdated(User)
  async updateMe(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() updateUserDto: UpdateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.update({
      owner,
      action: 'update',
      id: owner.id,
      body: updateUserDto,
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
    return Result(res, { data: { user: data }, message: 'Updated' });
  }

  /**
   * Update a User using id
   */
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a user using id' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  @ApiQuery(QueryPopulate)
  @ResponseUpdated(User)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.update({
      owner,
      action: 'update',
      id: +id,
      body: updateUserDto,
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
    return Result(res, { data: { user: data }, message: 'Updated' });
  }

  /**
   * Return all Users list
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
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
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all customer list
   */
  @Get('customer')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAllCustomer(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
        owner,
        action: 'findAllCustomer',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all customer list
   */
  @Get('dispenser')
  @ApiOperation({ summary: 'Get all dispensers' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAllDispenser(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
        owner,
        action: 'findAllDispenser',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all customer list
   */
  @Get('applicant')
  @ApiOperation({ summary: 'Get all applicants' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAllDispenserApplicant(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
        owner,
        action: 'findAllDispenserApplicant',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all customer list
   */
  @Get('my-referrals')
  @ApiOperation({ summary: 'Get all my referrals' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAllMyReferrals(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
        owner,
        action: 'findAllMyReferrals',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all customer list
   */
  @Public()
  @Get('find-a-rep')
  @ApiOperation({ summary: 'Get all dispensers' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findARep(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll({
        owner,
        action: 'findARep',
        payload: { ...query },
      });

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Return all entity documents list
   */
  @Get('customer-export-xls')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Create ${pluralizeString('Customer')} xls` })
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
    const { error, data } = await this.userService.createCustomerXls({
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
   * Return all entity documents list
   */
  @Get('dispenser-export-xls')
  @Roles(Role.Admin)
  @ApiOperation({ summary: `Create ${pluralizeString('Dispenser')} xls` })
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
  async exportDispenserXls(
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.createDispenserXls({
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
   * Find one User
   */
  @Get('find')
  @Public()
  @ApiOperation({ summary: 'Find a user' })
  @ApiQueryGetOne()
  @ResponseGetOne(User)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findOne({
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Get logged in user details
   */
  @Get('me')
  @ApiOperation({ summary: 'Get logged in user details' })
  @ApiQueryGetById()
  @ResponseGetOne(User)
  async findMe(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findById({
      owner,
      action: 'findById',
      id: owner.id,
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Get a User by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user using id' })
  @ApiQueryGetById()
  @ResponseGetOne(User)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findById({
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Delete a User using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a user using id' })
  @ApiQueryDelete()
  @ResponseDeleted(User)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.delete({
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
    return Result(res, { data: { user: data }, message: 'Deleted' });
  }

  /**
   * Change password for logged in user
   */
  @Post('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for logged in user' })
  @ApiOkResponse({
    description: 'Success',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password changed',
        },
      },
    },
  })
  @OwnerIncludeAttribute('password')
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { error } = await this.userService.changePassword({
      owner,
      payload: changePasswordDto,
    });

    if (!!error) {
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
    return Result(res, { message: 'Password changed' });
  }

  /**
   * Change password for logged in user
   */
  @Post('password-by-admin')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for user by admin' })
  @ApiOkResponse({
    description: 'Success',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Password changed',
        },
      },
    },
  })
  async changePasswordByAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() changePasswordByAdminDto: ChangePasswordByAdminDto,
  ) {
    const { error } = await this.userService.changePasswordByAdmin({
      owner,
      payload: changePasswordByAdminDto,
    });

    if (!!error) {
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
    return Result(res, { message: 'Password changed' });
  }
}
