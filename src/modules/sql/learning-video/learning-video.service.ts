import {
  ModelService,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningVideo } from './entities/learning-video.entity';

@Injectable()
export class LearningVideoService extends ModelService<LearningVideo> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['title'];

  constructor(db: SqlService<LearningVideo>) {
    super(db);
  }

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<LearningVideo>,
  ): Promise<SqlCreateBulkResponse<LearningVideo>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: LearningVideo[] = [];
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
