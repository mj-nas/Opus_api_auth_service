import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { CartItemModule } from '../cart-item/cart-item.module';
import { ProductReviewModule } from '../product-review/product-review.module';
import { ReferredProductsModule } from '../referred-products/referred-products.module';
import { Products } from './entities/products.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    SqlModule.register(Products),
    MsClientModule,
    ProductReviewModule,
    CartItemModule,
    ReferredProductsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
