import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService extends ModelService<ProductCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ProductCategory>) {
    super(db);
  }
}
