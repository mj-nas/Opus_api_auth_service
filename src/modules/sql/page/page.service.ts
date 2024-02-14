import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Page } from './entities/page.entity';

@Injectable()
export class PageService extends ModelService<Page> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'title'];

  constructor(db: SqlService<Page>) {
    super(db);
  }

  /**
   * doBeforeUpdate
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeUpdate(job: SqlJob<Page>): Promise<void> {
    await super.doBeforeUpdate(job);
    delete job.body.name;
    delete job.body.allow_html;
  }
}
