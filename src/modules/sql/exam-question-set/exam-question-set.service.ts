import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamQuestionSet } from './entities/exam-question-set.entity';

@Injectable()
export class ExamQuestionSetService extends ModelService<ExamQuestionSet> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ExamQuestionSet>) {
    super(db);
  }
}
