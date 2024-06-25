import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CachingModule } from 'src/core/modules/caching/caching.module';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { SessionModule } from 'src/core/modules/session/session.module';
import { LoginLogModule } from 'src/modules/mongo/login-log/login-log.module';
import { OtpSessionModule } from 'src/modules/mongo/otp-session/otp-session.module';
import { CartItemModule } from '../cart-item/cart-item.module';
import { CartModule } from '../cart/cart.module';
import { NotificationModule } from '../notification/notification.module';
import { ReferralModule } from '../referral/referral.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { TokenStrategy } from './strategies/token/token.strategy';

@Module({
  imports: [
    ConfigModule,
    SessionModule,
    LoginLogModule,
    OtpSessionModule,
    UserModule,
    CachingModule,
    MsClientModule,
    NotificationModule,
    ReferralModule,
    CartModule,
    CartItemModule,
  ],
  providers: [AuthService, JwtStrategy, TokenStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
