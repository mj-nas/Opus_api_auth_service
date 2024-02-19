import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoryService } from './product-category.service';
import { ProductCategory } from './entities/product-category.entity';

@Module({
  imports: [SqlModule.register(ProductCategory)],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}
