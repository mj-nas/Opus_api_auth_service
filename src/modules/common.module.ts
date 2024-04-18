import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { QueryGuard } from 'src/core/guards/query.guard';
import { SettingsInterceptor } from 'src/core/interceptors/sql/settings.interceptors';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { HistoryModule } from './mongo/history/history.module';
import { LoginLogModule } from './mongo/login-log/login-log.module';
import { OtpSessionModule } from './mongo/otp-session/otp-session.module';
import { TaskModule } from './mongo/task/task.module';
import { TrashModule } from './mongo/trash/trash.module';
import { AuthModule } from './sql/auth/auth.module';
import { RolesGuard } from './sql/auth/roles.guard';
import { JwtAuthGuard } from './sql/auth/strategies/jwt/jwt-auth.guard';
import { LocalAuthModule } from './sql/auth/strategies/local/local-auth.module';
import { ContactUsModule } from './sql/contact-us/contact-us.module';
import { CountryModule } from './sql/country/country.module';
import { CouponModule } from './sql/coupon/coupon.module';
import { LearnArticleModule } from './sql/learn-article/learn-article.module';
import { LearnYoutubeModule } from './sql/learn-youtube/learn-youtube.module';
import { NotificationModule } from './sql/notification/notification.module';
import { PageModule } from './sql/page/page.module';
import { ProductCategoryModule } from './sql/product-category/product-category.module';
import { ProductGalleryModule } from './sql/product-gallery/product-gallery.module';
import { ProductSpecificationsModule } from './sql/product-specifications/product-specifications.module';
import { ProductsModule } from './sql/products/products.module';
import { SettingModule } from './sql/setting/setting.module';
import { StateModule } from './sql/state/state.module';
import { TemplateModule } from './sql/template/template.module';
import { TestimonialsModule } from './sql/testimonials/testimonials.module';
import { UserModule } from './sql/user/user.module';
import { WishlistModule } from './sql/wishlist/wishlist.module';

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
      ProductsModule,
      ProductCategoryModule,
      ProductGalleryModule,
      ProductSpecificationsModule,
      CouponModule,
      TestimonialsModule,
      ContactUsModule,
      LearnYoutubeModule,
      LearnArticleModule,
      WishlistModule,
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
      CommonService,
    ];

    return {
      module: CommonModule,
      imports: modules,
      controllers: [CommonController],
      providers,
    };
  }
}
