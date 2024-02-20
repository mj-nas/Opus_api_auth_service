import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductSpecifications } from './entities/product-specifications.entity';

@Injectable()
export class ProductSpecificationsService extends ModelService<ProductSpecifications> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ProductSpecifications>) {
    super(db);
  }
}
