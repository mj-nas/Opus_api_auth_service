import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as moment from 'moment-timezone';
import { Op } from 'sequelize';
import { NotFoundError } from 'src/core/core.errors';
import { Job, JobResponse } from 'src/core/core.job';
import { generateHash, otp } from 'src/core/core.utils';
import { OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { CachingService } from 'src/core/modules/caching/caching.service';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { SessionService } from 'src/core/modules/session/session.service';
import { LoginLog } from 'src/modules/mongo/login-log/entities/login-log.entity';
import { LoginLogService } from 'src/modules/mongo/login-log/login-log.service';
import { OtpSessionType } from 'src/modules/mongo/otp-session/entities/otp-session.entity';
import { OtpSessionService } from 'src/modules/mongo/otp-session/otp-session.service';
import { CartItemService } from '../cart-item/cart-item.service';
import { CartService } from '../cart/cart.service';
import { NotificationService } from '../notification/notification.service';
import { ReferralService } from '../referral/referral.service';
import { ConnectionVia } from '../user/connection-via.enum';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SignupDispenserDto } from './dto/signup-dispenser.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TokenAuthDto } from './strategies/token/token-auth.dto';

export interface AuthResponse {
  error?: any;
  user?: User;
}

@Injectable()
export class AuthService {
  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private referralService: ReferralService,
    private cartService: CartService,
    private cartItemService: CartItemService,
    private loginLogService: LoginLogService,
    private otpSessionService: OtpSessionService,
    private _cache: CachingService,
    private msClient: MsClientService,
    private notificationService: NotificationService,
  ) {}

  async createSession(owner: OwnerDto, info: any): Promise<any> {
    try {
      const refreshToken = randomBytes(40).toString('hex');
      const { error, data } = await this.loginLogService.create({
        action: 'create',
        owner,
        body: {
          token: refreshToken,
          token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          user_id: owner.id,
          info,
        },
      });
      if (!!error) return { error };
      const {
        token,
        tokenExpiry,
        error: tokenError,
      } = await this.sessionService.createToken({
        sessionId: data._id,
        userId: owner.id,
      });
      if (tokenError) {
        return { error: tokenError };
      }
      return {
        error: false,
        data: {
          token,
          token_expiry: tokenExpiry,
          refresh_token: refreshToken,
          user: owner,
          session_id: data._id,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async createUserSession(
    userId: number,
    isAdmin: boolean,
    info: any,
  ): Promise<any> {
    try {
      const userWhere: any = { id: userId };
      if (isAdmin) {
        userWhere.role = { [Op.ne]: 'Admin' };
      }
      const { error, data: user } = await this.userService.findOne({
        payload: {
          where: userWhere,
          allowEmpty: false,
        },
      });
      if (!!error) {
        return { error: 'Account does not exist' };
      } else {
        if (!user.getDataValue('active')) {
          return { error: 'Account is inactive' };
        }
        const refreshToken = randomBytes(40).toString('hex');
        const { error, data } = await this.loginLogService.create({
          action: 'create',
          body: {
            token: refreshToken,
            token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            user_id: user.getDataValue('id'),
            info,
          },
        });
        if (!!error) return { error };
        const {
          token,
          tokenExpiry,
          error: tokenError,
        } = await this.sessionService.createToken({
          sessionId: data._id,
          userId,
        });
        if (tokenError) {
          return { error: tokenError };
        }
        return {
          error: false,
          data: {
            token,
            token_expiry: tokenExpiry,
            refresh_token: refreshToken,
            user,
            session_id: data._id,
          },
        };
      }
    } catch (error) {
      return { error };
    }
  }

  async createOtpSession(user: OwnerDto, payload?: any): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.create({
      body: {
        user_id: user.id,
        otp: otp(4),
        type: OtpSessionType.Login,
        expire_at: new Date(Date.now() + 15 * 60 * 1000),
        payload,
      },
    });
    // TODO: send a email/sms notification
    return { error, data };
  }

  async getNewToken(tokens: TokenAuthDto, session: LoginLog): Promise<any> {
    try {
      const { decoded, error } = await this.sessionService.decodeToken(
        tokens.token,
      );
      if (error) {
        return { error };
      }
      if (
        decoded.sessionId !== String(session._id) ||
        decoded.userId !== session.user_id
      ) {
        return { error: 'Invalid token' };
      }
      const refreshToken = randomBytes(40).toString('hex');
      const { token, tokenExpiry } = await this.sessionService.createToken({
        sessionId: session._id,
        userId: session.user_id,
      });
      await this.loginLogService.update({
        id: session.id,
        body: {
          token: refreshToken,
        },
      });

      const authExp = new Date(decoded.exp * 1000);
      authExp.setHours(23, 59, 59, 999);
      const expireAt = authExp.getTime() - new Date().getTime();

      this._cache.addToBlackList({
        sessionId: session.id,
        token: tokens.token,
        expireAt,
      });
      return {
        error: false,
        data: { token, refresh_token: refreshToken, token_expiry: tokenExpiry },
      };
    } catch (error) {
      return { error };
    }
  }

  async clearSession(owner: OwnerDto, token: string) {
    const { exp, sessionId } = owner;
    await this.loginLogService.update({
      action: 'update',
      id: sessionId,
      body: {
        logout_at: moment().toDate(),
        active: false,
      },
    });

    const authExp = new Date(exp * 1000);
    authExp.setHours(23, 59, 59, 999);
    const authRedisExpiry = authExp.getTime() - new Date().getTime();
    await this._cache.addToBlackList({
      expireAt: Math.floor(authRedisExpiry),
      token,
      sessionId,
    });
  }

  async verifyEmail(email: string): Promise<JobResponse> {
    const { error, data } = await this.userService.findOne({
      payload: {
        where: { email },
        allowEmpty: true,
      },
    });

    if (error instanceof NotFoundError) {
      return { error: 'User not found' };
    }

    if (!!error) {
      return { error };
    } else if (!!data) {
      if (!data.getDataValue('active')) {
        return {
          error:
            'Your account has been blocked by the Admin. Please contact Admin to activate your account',
        };
      }
      return { error: false, data };
    } else {
      return { error: 'Invalid email' };
    }
  }

  async forgotOtp(user: User): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.create({
      body: {
        user_id: user.id,
        otp: otp(4),
        type: OtpSessionType.Forgot,
        expire_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    await this.notificationService.send({
      action: 'send',
      payload: {
        user_id: user.id,
        template: 'forgot_password',
        variables: {
          OTP: data.otp,
        },
      },
    });
    return { error, data };
  }

  async verifyOtp(body: VerifyOtpDto): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.findById({
      id: body.session_id,
    });
    if (!!error) {
      return { error: 'Invalid session', errorCode: 403 };
    }
    if (
      !!data.verified ||
      moment(data.expire_at).diff(moment(), 'seconds') <= 0
    ) {
      return {
        error:
          'Session expired. Please go back to the previous page and restart the process',
        errorCode: 403,
      };
    }
    if (data.retry_limit <= 0) {
      return { error: 'Maximum number of retries exceeded', errorCode: 403 };
    }
    if (data.otp !== body.otp) {
      try {
        data.retry_limit--;
        await data.save();
        return { error: 'Invalid Code' };
      } catch (error) {
        return { error };
      }
    }
    try {
      data.verified = true;
      await data.save();
      return { error: false, data };
    } catch (error) {
      return { error };
    }
  }

  async sendOtp(body: SendOtpDto): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.findById({
      id: body.session_id,
    });
    if (!!error) {
      return { error: 'Invalid session', errorCode: 403 };
    }
    if (
      !!data.verified ||
      moment(data.expire_at).diff(moment(), 'seconds') <= 0
    ) {
      return {
        error:
          'Session expired. Please go back to the previous page and restart the process',
        errorCode: 403,
      };
    }
    if (data.resend_limit <= 0) {
      return { error: 'Maximum number of retries exceeded' };
    }
    try {
      // data.expire_at = moment().add(15, 'minutes');
      data.resend_limit--;
      await data.save();
    } catch (error) {
      return { error };
    }

    if (data.type === OtpSessionType.Forgot) {
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: data.user_id,
            template: 'forgot_password',
            variables: {
              OTP: data.otp,
            },
          },
        }),
      );
    } else if (
      data.type === OtpSessionType.EmailVerify ||
      data.type === OtpSessionType.Login
    ) {
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: data.user_id,
            template: 'email_verification',
            variables: {
              OTP: data.otp,
            },
          },
        }),
      );
    }
    return { error: false, data };
  }

  async resetPassword(body: ResetPasswordDto): Promise<JobResponse> {
    const otpSession = await this.otpSessionService.findById({
      id: body.session_id,
    });
    if (!!otpSession.error || !otpSession.data.verified) {
      return { error: 'Invalid session', errorCode: 403 };
    }
    if (moment(otpSession.data.expire_at).diff(moment(), 'seconds') <= 0) {
      return { error: 'Session expired', errorCode: 403 };
    }
    const userUpdate = await this.userService.update({
      id: otpSession.data.user_id,
      body: {
        password: await generateHash(body.password),
      },
    });
    if (!!userUpdate.error) {
      return { error: 'Unable to change password, Please try again' };
    }
    await this.otpSessionService.delete({
      id: body.session_id,
    });
    return { error: false };
  }

  async emailVerifyOtp(
    type: OtpSessionType,
    user: User,
    payload?: any,
  ): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.create({
      body: {
        user_id: user.id,
        otp: otp(4),
        type: type,
        expire_at: new Date(Date.now() + 15 * 60 * 1000),
        payload,
      },
    });
    await this.notificationService.send({
      action: 'send',
      payload: {
        user_id: user.id,
        template: 'email_verification',
        variables: {
          OTP: data.otp,
        },
      },
    });
    return { error, data };
  }

  async signup(body: SignupDto | SignupDispenserDto): Promise<JobResponse> {
    try {
      const checkEmail = await this.userService.findOne({
        payload: {
          where: { email: body.email },
        },
      });
      if (!!checkEmail.data) {
        return {
          error:
            'This email address is already associated with an existing account. Please use a different email address or try logging in with your existing account.',
        };
      }

      // Create a new user
      const { error, data } = await this.userService.create({
        action: 'create',
        body: {
          ...body,
        },
      });

      if (error) {
        return { error, message: 'User signup failed' };
      }

      return { data };
    } catch (error) {
      return { error };
    }
  }

  async emailOtpVerify(body: VerifyOtpDto): Promise<JobResponse> {
    try {
      const { data, errorCode, error } = await this.verifyOtp(body);
      if (!!error || !data.verified) {
        return { error, errorCode, data };
      }

      const userDetails = await this.userService.$db.updateRecord({
        id: data.user_id,
        body: {
          email_verified: 'Y',
        },
      });

      if (!!userDetails.error) {
        return { error };
      }

      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: data.user_id,
            template: 'email_verification_completed',
            skipUserConfig: true,
            variables: {
              TO_NAME: userDetails.data.name,
            },
          },
        }),
      );

      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: data.user_id,
            template: 'welcome_mail',
            skipUserConfig: true,
            variables: {
              TO_NAME: userDetails.data.name,
              USERNAME: userDetails.data.email,
            },
          },
        }),
      );

      return { error: false, data };
    } catch (error) {
      return { error };
    }
  }

  async connectingToDispenser({
    dispenser_id,
    user_id,
    type,
    uid,
  }: {
    dispenser_id: number;
    user_id: number;
    uid: string;
    type: ConnectionVia;
  }) {
    console.log({
      dispenser_id,
      user_id,
      type,
      uid,
      isType: type === ConnectionVia.Referral,
    });
    try {
      const { error, data } = await this.userService.findById({
        action: 'connectingToDispenser',
        id: +user_id,
      });
      if (!!error) {
        throw error;
      }
      if (!data.dispenser_id) {
        // connect to Dispenser
        data.setDataValue('dispenser_id', dispenser_id);
        data.setDataValue(
          'connection_via',
          type === ConnectionVia.Referral
            ? ConnectionVia.Referral
            : ConnectionVia.Connect,
        );
        await data.save();

        // if the connection type is Referral
        if (type === ConnectionVia.Referral) {
          const referral = await this.referralService.findOne({
            payload: {
              where: { uid },
              populate: ['products'],
            },
          });
          console.log(referral?.data);
          if (!!referral.error) {
            throw referral.error;
          }

          if (referral.data.products.length) {
            const cart = await this.cartService.$db.findOrCreate({
              owner: { id: user_id },
              options: {
                where: { user_id },
                include: [{ association: 'items' }],
              },
              body: {
                user_id,
              },
            });
            console.log(cart);
            if (!!cart.error) {
              throw cart.error;
            }
            console.log(referral.data.products);
            for await (const referred_product of referral.data.products) {
              console.log(referred_product);
              const index = cart.data.items.findIndex(
                (item) => item.product_id === referred_product.product_id,
              );
              console.log(index);
              if (index >= 0) {
                await this.cartItemService.$db.updateRecord({
                  owner: { id: user_id },
                  id: +cart.data.items[index].id,
                  body: {
                    quantity: cart.data.items[index].quantity + 1,
                  },
                });
              } else {
                await this.cartItemService.$db.createRecord({
                  owner: { id: user_id },
                  body: {
                    cart_id: cart.data.id,
                    product_id: referred_product.product_id,
                    quantity: 1,
                  },
                });
              }
            }
          }
        }
      }
      return { data };
    } catch (error) {
      console.error(error);
      return { error };
    }
  }
}
