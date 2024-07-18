import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Job } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { ProductReview } from './entities/product-review.entity';

@Injectable()
export class ProductReviewService extends ModelService<ProductReview> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<ProductReview>,
    private _msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<ProductReview>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllReviews') {
      job.options.where = {
        ...job.options.where,
        status: 'Approved',
      };
    }
  }

  async createReview(job: Job) {
    try {
      const { body } = job.payload;
      const { error, data } = await this.$db.findOrCreate({
        owner: job.owner,
        action: 'findOrCreate',
        body: body,
        options: {
          where: {
            order_id: body.order_id,
            product_id: body.product_id,
            created_by: job.owner.id,
          },
        },
      });
      if (!!error) {
        return { error };
      }

      await this._msClient.executeJob('product.review.create', {
        payload: {
          product_id: body.product_id,
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
