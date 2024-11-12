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
import { WebhookModule } from './mongo/webhook/webhook.module';
import { SocketEventModule } from './socket-event/socket-event.module';
import { AddressModule } from './sql/address/address.module';
import { AuthModule } from './sql/auth/auth.module';
import { RolesGuard } from './sql/auth/roles.guard';
import { JwtAuthGuard } from './sql/auth/strategies/jwt/jwt-auth.guard';
import { LocalAuthModule } from './sql/auth/strategies/local/local-auth.module';
import { CartItemModule } from './sql/cart-item/cart-item.module';
import { CartModule } from './sql/cart/cart.module';
import { CmsHomeModule } from './sql/cms-home/cms-home.module';
import { CommissionModule } from './sql/commission/commission.module';
import { ContactUsModule } from './sql/contact-us/contact-us.module';
import { CountryModule } from './sql/country/country.module';
import { CouponUsedModule } from './sql/coupon-used/coupon-used.module';
import { CouponModule } from './sql/coupon/coupon.module';
import { DashboardModule } from './sql/dashboard/dashboard.module';
import { ExamModuleModule } from './sql/exam-module/exam-module.module';
import { ExamQuestionOptionsModule } from './sql/exam-question-options/exam-question-options.module';
import { ExamQuestionSetModule } from './sql/exam-question-set/exam-question-set.module';
import { ExamQuestionsModule } from './sql/exam-questions/exam-questions.module';
import { ExamVideoModule } from './sql/exam-video/exam-video.module';
import { GalleryCategoryModule } from './sql/gallery-category/gallery-category.module';
import { GalleryModule } from './sql/gallery/gallery.module';
import { LearnArticleModule } from './sql/learn-article/learn-article.module';
import { LearnYoutubeModule } from './sql/learn-youtube/learn-youtube.module';
import { LearningModuleModule } from './sql/learning-module/learning-module.module';
import { LearningQuestionOptionsModule } from './sql/learning-question-options/learning-question-options.module';
import { LearningQuestionSetModule } from './sql/learning-question-set/learning-question-set.module';
import { LearningQuestionsModule } from './sql/learning-questions/learning-questions.module';
import { LearningVideoModule } from './sql/learning-video/learning-video.module';
import { NotificationModule } from './sql/notification/notification.module';
import { OrderAddressModule } from './sql/order-address/order-address.module';
import { OrderItemModule } from './sql/order-item/order-item.module';
import { OrderPaymentModule } from './sql/order-payment/order-payment.module';
import { OrderStatusLogModule } from './sql/order-status-log/order-status-log.module';
import { OrderModule } from './sql/order/order.module';
import { PageModule } from './sql/page/page.module';
import { ProductCategoryModule } from './sql/product-category/product-category.module';
import { ProductGalleryModule } from './sql/product-gallery/product-gallery.module';
import { ProductReviewModule } from './sql/product-review/product-review.module';
import { ProductSpecificationsModule } from './sql/product-specifications/product-specifications.module';
import { ProductsModule } from './sql/products/products.module';
import { RecentlyViewedModule } from './sql/recently-viewed/recently-viewed.module';
import { ReferralModule } from './sql/referral/referral.module';
import { ReferredCouponModule } from './sql/referred-coupon/referred-coupon.module';
import { ReferredProductsModule } from './sql/referred-products/referred-products.module';
import { SettingModule } from './sql/setting/setting.module';
import { StateModule } from './sql/state/state.module';
import { TemplateModule } from './sql/template/template.module';
import { TestimonialsModule } from './sql/testimonials/testimonials.module';
import { UserDispenserModule } from './sql/user-dispenser/user-dispenser.module';
import { UserExamsModule } from './sql/user-exams/user-exams.module';
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
      RecentlyViewedModule,
      CartModule,
      CartItemModule,
      SocketEventModule,
      AddressModule,
      OrderModule,
      OrderAddressModule,
      OrderItemModule,
      OrderStatusLogModule,
      OrderPaymentModule,
      WebhookModule,
      ProductReviewModule,
      GalleryCategoryModule,
      GalleryModule,
      ReferralModule,
      ReferredProductsModule,
      ReferredCouponModule,
      CommissionModule,
      CouponUsedModule,
      UserDispenserModule,
      LearningModuleModule,
      LearningQuestionSetModule,
      LearningQuestionsModule,
      LearningQuestionOptionsModule,
      LearningVideoModule,
      UserExamsModule,
      ExamModuleModule,
      ExamVideoModule,
      ExamQuestionSetModule,
      ExamQuestionsModule,
      ExamQuestionOptionsModule,
      DashboardModule,
      CmsHomeModule,
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
