import { MongoModule } from '@core/mongo';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CommonModule } from './modules/common.module';
import { SqlModule } from '@core/sql';
import { EmailModule } from '@core/email';
import { TwilioModule } from '@core/twilio';
import { FirebaseModule } from '@core/firebase';
import { StripeModule } from '@core/stripe';
import { ProductsModule } from './modules/sql/products/products.module';
import { ProductCategoryModule } from './modules/sql/product-category/product-category.module';

@Module({
  imports: [
    CoreModule,
    MongoModule.root({ seeder: true }),
    CommonModule.register(),
    SqlModule.root({ seeder: true }),
    ProductsModule,
    ProductCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
