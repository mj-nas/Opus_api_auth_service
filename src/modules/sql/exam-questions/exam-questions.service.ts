import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamQuestions } from './entities/exam-questions.entity';

@Injectable()
export class ExamQuestionsService extends ModelService<ExamQuestions> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ExamQuestions>) {
    super(db);
  }
}
