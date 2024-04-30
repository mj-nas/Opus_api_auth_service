import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { RecentlyViewed } from './entities/recently-viewed.entity';

@Injectable()
export class RecentlyViewedService extends ModelService<RecentlyViewed> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [];

  constructor(db: SqlService<RecentlyViewed>) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<RecentlyViewed>): Promise<void> {
    await super.doBeforeFindAll(job);
    job.options.where = { ...job.options.where, user_id: job.owner.id };
  }
}
