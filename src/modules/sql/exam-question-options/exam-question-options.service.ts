import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamQuestionOptions } from './entities/exam-question-options.entity';

@Injectable()
export class ExamQuestionOptionsService extends ModelService<ExamQuestionOptions> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ExamQuestionOptions>) {
    super(db);
  }
}
