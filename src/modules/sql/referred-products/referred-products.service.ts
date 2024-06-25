import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ReferredProducts } from './entities/referred-products.entity';

@Injectable()
export class ReferredProductsService extends ModelService<ReferredProducts> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ReferredProducts>) {
    super(db);
  }
}
