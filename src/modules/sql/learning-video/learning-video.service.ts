import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningVideo } from './entities/learning-video.entity';

@Injectable()
export class LearningVideoService extends ModelService<LearningVideo> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<LearningVideo>) {
    super(db);
  }
}
