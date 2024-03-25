import {
  ModelService,
  ModelWrap,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
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

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<LearnArticle>,
  ): Promise<SqlCreateBulkResponse<LearnArticle>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: ModelWrap<LearnArticle>[] = [];
    for (let index = 0; index < job.records.length; index++) {
      const record = job.records[index];
      const response = await this.update({
        owner: job.owner,
        action: 'update',
        id: record.id,
        body: record,
        options: {
          fields: ['sort'],
        },
      });
      productSort.push(response.data);
    }
    return { data: productSort };
  }
}
