import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ProductCategory } from './entities/product-category.entity';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoryService } from './product-category.service';

@Module({
  imports: [SqlModule.register(ProductCategory), ProductsModule],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
})
export class ProductCategoryModule {}
