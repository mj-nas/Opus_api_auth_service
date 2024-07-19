import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ExamVideo } from './entities/exam-video.entity';

@Injectable()
export class ExamVideoService extends ModelService<ExamVideo> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ExamVideo>) {
    super(db);
  }
}
