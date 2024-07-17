import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningQuestionSet } from './entities/learning-question-set.entity';

@Injectable()
export class LearningQuestionSetService extends ModelService<LearningQuestionSet> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<LearningQuestionSet>) {
    super(db);
  }
}
