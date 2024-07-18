import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningQuestionOptions } from './entities/learning-question-options.entity';

@Injectable()
export class LearningQuestionOptionsService extends ModelService<LearningQuestionOptions> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<LearningQuestionOptions>) {
    super(db);
  }
}
