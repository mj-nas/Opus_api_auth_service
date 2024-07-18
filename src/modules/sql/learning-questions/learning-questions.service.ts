import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningQuestions } from './entities/learning-questions.entity';

@Injectable()
export class LearningQuestionsService extends ModelService<LearningQuestions> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['question'];

  constructor(db: SqlService<LearningQuestions>) {
    super(db);
  }
}
