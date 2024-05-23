import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductReview } from './entities/product-review.entity';

@Injectable()
export class ProductReviewService extends ModelService<ProductReview> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ProductReview>) {
    super(db);
  }
}
