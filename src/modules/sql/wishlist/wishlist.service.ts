import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/core/core.errors';
import { Job, JobResponse } from 'src/core/core.job';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService extends ModelService<Wishlist> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Wishlist>) {
    super(db);
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: SqlJob<Wishlist>): Promise<void> {
    await super.doBeforeCreate(job);
    job.body.user_id = job.owner.id;
  }

  async addOrRemove(job: Job): Promise<JobResponse> {
    try {
      const {
        owner,
        payload: { product_id },
      } = job;
      const { error, data } = await this.$db.findOneRecord({
        options: {
          where: {
            product_id,
            user_id: owner.id,
          },
        },
      });
      if (!!error) {
        if (error instanceof NotFoundError) {
          const { error: createErr, data: createdData } = await this.create({
            owner,
            action: 'create',
            body: { product_id },
          });
          if (!!createErr) return { error: createErr };
          return {
            data: createdData,
            message: 'The product has been wishlisted successfully.',
          };
        }
        return { error };
      }

      const { error: deleteErr, data: deleteData } = await this.delete({
        owner,
        action: 'delete',
        id: data.id,
      });
      if (!!deleteErr) return { error: deleteErr };
      return {
        data: deleteData,
        message: 'The product has been removed from the wishlist.',
      };
    } catch (error) {
      return { error };
    }
  }
}
