import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearnArticle } from './entities/learn-article.entity';

@Injectable()
export class LearnArticleService extends ModelService<LearnArticle> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['title'];

  constructor(db: SqlService<LearnArticle>) {
    super(db);
  }
}
