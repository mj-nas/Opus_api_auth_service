import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { QueryGuard } from 'src/core/guards/query.guard';
import { HistoryModule } from './mongo/history/history.module';
import { LoginLogModule } from './mongo/login-log/login-log.module';
import { OtpSessionModule } from './mongo/otp-session/otp-session.module';
import { TaskModule } from './mongo/task/task.module';
import { TrashModule } from './mongo/trash/trash.module';
import { AuthModule } from './sql/auth/auth.module';
import { LocalAuthModule } from './sql/auth/strategies/local/local-auth.module';
import { CountryModule } from './sql/country/country.module';
import { PageModule } from './sql/page/page.module';
import { NotificationModule } from './sql/notification/notification.module';
import { SettingModule } from './sql/setting/setting.module';
import { StateModule } from './sql/state/state.module';
import { TemplateModule } from './sql/template/template.module';
import { UserModule } from './sql/user/user.module';
import { JwtAuthGuard } from './sql/auth/strategies/jwt/jwt-auth.guard';
import { RolesGuard } from './sql/auth/roles.guard';
import { SettingsInterceptor } from 'src/core/interceptors/sql/settings.interceptors';

@Module({})
export class CommonModule {
  static register(): DynamicModule {
    // common imports
    const modules = [
      TaskModule,
      HistoryModule,
      TrashModule,
      LoginLogModule,
      OtpSessionModule,
      AuthModule,
      LocalAuthModule,
      CountryModule,
      PageModule,
      NotificationModule,
      SettingModule,
      StateModule,
      TemplateModule,
      UserModule,
    ];

    // common providers
    const providers: any = [
      {
        provide: APP_GUARD,
        useClass: QueryGuard,
      },
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
      { provide: APP_INTERCEPTOR, useClass: SettingsInterceptor },
    ];

    return {
      module: CommonModule,
      imports: modules,
      providers,
    };
  }
}
