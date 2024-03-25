import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearnYoutube } from './entities/learn-youtube.entity';

@Injectable()
export class LearnYoutubeService extends ModelService<LearnYoutube> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['title'];

  constructor(db: SqlService<LearnYoutube>) {
    super(db);
  }
}
