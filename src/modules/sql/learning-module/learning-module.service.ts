import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningModule } from './entities/learning-module.entity';

@Injectable()
export class LearningModuleService extends ModelService<LearningModule> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<LearningModule>) {
    super(db);
  }
}
