/* eslint-disable prettier/prettier */
import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { compareHash, generateHash } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { User } from './entities/user.entity';
import { Role } from './role.enum';

@Injectable()
export class UserService extends ModelService<User> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(
    db: SqlService<User>,
    private msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * change user password
   * @param job
   * @returns Promise<JobResponse>
   */
  async changePassword(job: Job): Promise<JobResponse> {
    // eslint-disable-next-line prefer-const
    let { owner, payload } = job;

    const password = await generateHash(payload.password);
    if (!(await compareHash(payload.old_password, owner.password))) {
      return { error: 'Your current password is wrong. Please try again.' };
    }

    //check password and old password are same
    if (await compareHash(payload.password, owner.password)) {
      return {
        error: 'Your new password has to be different from  your old password ',
      };
    }

    try {
      const userResult = await this.$db.updateRecord({
        action: 'findById',
        id: owner.id,
        body: {
          password,
        },
      });
      return userResult;
    } catch (error) {
      return { error };
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
    job: SqlJob<User>,
    response: SqlUpdateResponse<User>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    const { active, id } = response.data;
    const { active: previousActive } = response.previousData;

    // check if the status changed
    if (previousActive !== active) {
      const status = active ? 'activated' : 'deactivated';
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            template: 'account_status_update',
            variables: {
              STATUS: status,
            },
            skipUserConfig: true,
            user_id: id,
          },
        }),
      );
    }
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<User>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllCustomer') {
      job.options.where = {
        ...job.options.where,
        role: Role.Customer,
      };
    }
  }

  async createCustomerXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
      const timezone: string = payload.timezone;
      delete payload.timezone;
      const { error, data } = await this.findAll({
        owner,
        action: 'findAllCustomer',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customer');

      worksheet.addRow([
        'Sl. No',
        'Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'Zip Code',
        'Created On',
      ]);

      const users: User[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x.email,
            `${x?.phone_code} ${x?.phone}`,
            x?.address,
            x?.city,
            x?.state,
            x?.zip_code,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 50 },
        { header: 'Address', key: 'address', width: 50 },
        { header: 'City', key: 'city', width: 50 },
        { header: 'State', key: 'state', width: 50 },
        { header: 'Zip Code', key: 'zip_code', width: 15 },
        { header: 'Created On', key: 'created_at', width: 25 },
      ];

      const folder = 'customer-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Customer.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!users.length,
        },
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
