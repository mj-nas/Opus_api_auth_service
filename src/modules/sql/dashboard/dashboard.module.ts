import { Module } from '@nestjs/common';
import { CommissionModule } from '../commission/commission.module';
import { CouponModule } from '../coupon/coupon.module';
import { GalleryModule } from '../gallery/gallery.module';
import { LearnArticleModule } from '../learn-article/learn-article.module';
import { LearnYoutubeModule } from '../learn-youtube/learn-youtube.module';
import { LearningModuleModule } from '../learning-module/learning-module.module';
import { LearningQuestionSetModule } from '../learning-question-set/learning-question-set.module';
import { LearningVideoModule } from '../learning-video/learning-video.module';
import { OrderModule } from '../order/order.module';
import { ProductCategoryModule } from '../product-category/product-category.module';
import { ProductsModule } from '../products/products.module';
import { UserModule } from '../user/user.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    UserModule,
    CouponModule,
    ProductsModule,
    OrderModule,
    LearnYoutubeModule,
    LearnArticleModule,
    GalleryModule,
    ProductCategoryModule,
    LearningModuleModule,
    LearningQuestionSetModule,
    LearningVideoModule,
    CommissionModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
