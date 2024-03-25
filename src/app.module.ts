import { MongoModule } from '@core/mongo';
import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CommonModule } from './modules/common.module';
import { ContactUsModule } from './modules/sql/contact-us/contact-us.module';
import { CouponModule } from './modules/sql/coupon/coupon.module';
import { ProductCategoryModule } from './modules/sql/product-category/product-category.module';
import { ProductGalleryModule } from './modules/sql/product-gallery/product-gallery.module';
import { ProductSpecificationsModule } from './modules/sql/product-specifications/product-specifications.module';
import { ProductsModule } from './modules/sql/products/products.module';
import { TestimonialsModule } from './modules/sql/testimonials/testimonials.module';

@Module({
  imports: [
    CoreModule,
    MongoModule.root({ seeder: true }),
    CommonModule.register(),
    SqlModule.root({ seeder: true }),
    ProductsModule,
    ProductCategoryModule,
    ProductGalleryModule,
    ProductSpecificationsModule,
    CouponModule,
    TestimonialsModule,
    ContactUsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
