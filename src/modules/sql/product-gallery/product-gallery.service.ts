import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductGallery } from './entities/product-gallery.entity';

@Injectable()
export class ProductGalleryService extends ModelService<ProductGallery> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ProductGallery>) {
    super(db);
  }
}
