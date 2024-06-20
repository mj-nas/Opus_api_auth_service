import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { GalleryCategory } from './entities/gallery-category.entity';

@Injectable()
export class GalleryCategoryService extends ModelService<GalleryCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<GalleryCategory>) {
    super(db);
  }
}
