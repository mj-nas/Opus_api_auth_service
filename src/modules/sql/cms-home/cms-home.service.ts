import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { CmsHome } from './entities/cms-home.entity';

@Injectable()
export class CmsHomeService extends ModelService<CmsHome> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<CmsHome>) {
    super(db);
  }
}
