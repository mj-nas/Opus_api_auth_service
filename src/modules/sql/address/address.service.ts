import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Address } from './entities/address.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AddressService extends ModelService<Address> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Address>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {
    super(db);
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeDelete(job: SqlJob<Address>): Promise<void> {
    await super.doBeforeDelete(job);
    //check if the address is primary
    const address = await this.findOne({
        options: { where: { id: job.id } },
      })
      if (address.data && address.data.is_primary== "Y") {
        throw new Error("Primary address cannot be deleted")
      }
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: SqlJob<Address>): Promise<void> {
    await super.doBeforeCreate(job);
    if (!!job.owner?.id) {
      job.body.user_id = job.owner.id;
    }
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<Address>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<Address>,
    response: SqlUpdateResponse<Address>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);

    if (job.body.is_primary === 'Y') {
      const { error, data } = await this.$db.updateBulkRecords({
        owner: job.owner,
        action: 'update',
        options: {
          where: { id: { [Op.ne]: job.id }, user_id: response.data.user_id },
        },
        body: { is_primary: 'N' },
      });
    }

    if (job.action == "update"){
      if(response.data.is_primary == "Y"){
        await this.userService.$db.updateRecord({
          options:{
            where:{
              id: response.data.user_id
            }
          },
          body:{
            ...response.data
          }
        })
      }
    }
  }
}
