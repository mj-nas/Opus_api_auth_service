import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamModule } from './entities/exam-module.entity';

@Injectable()
export class ExamModuleService extends ModelService<ExamModule> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ExamModule>) {
    super(db);
  }
}
