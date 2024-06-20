import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Gallery } from './entities/gallery.entity';

@Injectable()
export class GalleryService extends ModelService<Gallery> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Gallery>) {
    super(db);
  }
}
