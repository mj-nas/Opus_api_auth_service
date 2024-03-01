import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoryService } from './product-category.service';
import { ProductCategory } from './entities/product-category.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [SqlModule.register(ProductCategory), ProductsModule],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule { }
