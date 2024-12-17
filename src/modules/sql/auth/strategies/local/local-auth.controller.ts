import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ResponseInternalServerError,
  ResponseUnauthorized,
} from 'src/core/core.definitions';
import { ErrorResponse, Result, Unauthorized } from 'src/core/core.responses';
import { GetIP } from 'src/core/decorators/ip.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { OtpSessionType } from 'src/modules/mongo/otp-session/entities/otp-session.entity';
import { Role } from 'src/modules/sql/user/role.enum';
import { User } from '../../../user/entities/user.entity';
import { AuthService } from '../../auth.service';
import { LocalAuthDto } from './local-auth.dto';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@ApiUnauthorizedResponse(ResponseUnauthorized)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(User)
@Controller('auth/local')
export class LocalAuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login with username and password
   */
  @Post('')
  @Public()
  @ApiOperation({ summary: 'Local authentication' })
  @ApiOkResponse({
    description: 'Login success',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            user: {
              $ref: getSchemaPath(User),
            },
            token: {
              type: 'string',
            },
            token_expiry: {
              type: 'string',
              format: 'date-time',
            },
            refresh_token: {
              type: 'string',
            },
          },
        },
        message: {
          type: 'string',
          example: 'Created',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  async localLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() auth: LocalAuthDto,
    @GetIP() ip: string,
  ) {
    if (owner.role === Role.Customer && owner.email_verified !== 'Y') {
      const u = owner as User;
      const emailVerifyOtp = await this.authService.emailVerifyOtp(
        OtpSessionType.Login,
        u,
        {
          ...auth.info,
          ip,
        },
      );
      if (!!emailVerifyOtp.error) {
        return ErrorResponse(res, {
          error: emailVerifyOtp.error,
          message: `${emailVerifyOtp.error.message || emailVerifyOtp.error}`,
        });
      }

      return Result(res, {
        data: { otp: true, session_id: emailVerifyOtp.data._id },
        message: 'Code sent',
      });
    }

    if (owner.enable_2fa) {
      const _2faOtp = await this.authService.createOtpSession(owner, {
        ...auth.info,
        ip,
      });
      if (!!_2faOtp.error) {
        return ErrorResponse(res, {
          error: _2faOtp.error,
          message: `${_2faOtp.error.message || _2faOtp.error}`,
        });
      }
      return Result(res, {
        data: { otp: true, session_id: _2faOtp.data._id },
        message: 'Code sent',
      });
    }

    // // connecting to dispenser
    // if (owner.role === Role.Customer && auth.info && auth.info?.type) {
    //   const connectingToDispenser =
    //     await this.authService.connectingToDispenser({
    //       ...auth.info,
    //       user_id: owner.id,
    //     });
    //   if (!!connectingToDispenser.error) {
    //     return ErrorResponse(res, {
    //       error: connectingToDispenser.error,
    //       message: `${connectingToDispenser.error.message || connectingToDispenser.error}`,
    //     });
    //   }

    //   if (connectingToDispenser.data.dispenser_id) {
    //     owner.dispenser_id = connectingToDispenser.data.dispenser_id;
    //   }
    // }

    const { error, data } = await this.authService.createSession(owner, {
      ...auth.info,
      ip,
    });
    if (!!error) {
      return Unauthorized(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data, message: 'Login success' });
  }
}
