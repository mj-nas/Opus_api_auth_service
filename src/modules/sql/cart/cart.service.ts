import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService extends ModelService<Cart> {
  constructor(db: SqlService<Cart>) {
    super(db);
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: SqlJob<Cart>): Promise<void> {
    await super.doBeforeCreate(job);
    job.body = { user_id: job.owner.id };
  }
}
