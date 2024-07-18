import {
  ModelService,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import { LearningModule } from './entities/learning-module.entity';

@Injectable()
export class LearningModuleService extends ModelService<LearningModule> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['title', '$question_set.title$', '$video.title$'];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['question_set', 'video'];

  constructor(db: SqlService<LearningModule>) {
    super(db);
  }

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<LearningModule>,
  ): Promise<SqlCreateBulkResponse<LearningModule>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: LearningModule[] = [];
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
