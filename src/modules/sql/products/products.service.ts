import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Products } from './entities/products.entity';

@Injectable()
export class ProductsService extends ModelService<Products> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Products>) {
    super(db);
  }
}
