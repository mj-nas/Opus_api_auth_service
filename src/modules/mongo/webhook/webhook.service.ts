import {
  ModelService,
  MongoCreateResponse,
  MongoJob,
  MongoService,
} from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { Webhook } from './entities/webhook.entity';

@Injectable()
export class WebhookService extends ModelService<Webhook> {
  constructor(db: MongoService<Webhook>) {
    super(db);
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: MongoJob<Webhook>): Promise<void> {
    job.body.action = job.action;
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: MongoJob<Webhook>,
    response: MongoCreateResponse<Webhook>,
  ): Promise<void> {
    console.log({ job, response });
  }
}
