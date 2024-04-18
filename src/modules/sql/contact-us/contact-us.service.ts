import {
  ModelService,
  SqlCreateResponse,
  SqlJob,
  SqlService,
  WrapSqlJob,
} from '@core/sql';
import { ReadPayload } from '@core/sql/sql.decorator';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { SettingService } from '../setting/setting.service';
import { BulkDeleteMode } from './bulk-delete-mode.enum';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService extends ModelService<ContactUs> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(
    db: SqlService<ContactUs>,
    private msClient: MsClientService,
    private settingService: SettingService,
  ) {
    super(db);
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: SqlJob<ContactUs>,
    response: SqlCreateResponse<ContactUs>,
  ): Promise<void> {
    await super.doAfterCreate(job, response);
    const { owner } = job;
    const { data } = await this.settingService.findOne({
      owner,
      action: 'findOne',
      payload: { where: { name: 'contact_us' } },
    });
    if (data && data?.getDataValue('value')) {
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            template: 'contact_us',
            variables: {
              FIRST_NAME: response.data?.dataValues?.first_name,
              LAST_NAME: response.data?.dataValues?.last_name,
              NAME: response.data?.dataValues?.name,
              EMAIL: response.data?.dataValues?.email,
              MESSAGE: response.data?.dataValues?.message,
            },
            skipUserConfig: true,
            users: [
              {
                name: 'Super Admin',
                email: data.getDataValue('value'),
                send_email: true,
              },
            ],
          },
        }),
      );
    }
  }

  @WrapSqlJob
  @ReadPayload
  async allDelete(job: SqlJob<ContactUs>): Promise<JobResponse> {
    try {
      const { options } = job;
      const { error, data } = await this.$db.deleteBulkRecords({
        options: { ...options },
      });
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async bulkDelete(job: SqlJob<ContactUs>): Promise<JobResponse> {
    try {
      const { body, payload } = job;
      if (body?.mode === BulkDeleteMode.All) {
        delete payload.limit;
        delete payload.offset;
        const { error, data } = await this.allDelete({
          payload: { ...payload },
        });
        if (error) return { error };
        return { data };
      }

      const { error, data } = await this.$db.deleteBulkRecords({
        options: {
          where: {
            id: body?.ids || [],
          },
        },
      });
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async createXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
      const timezone: string = payload.timezone;
      delete payload.timezone;
      const { error, data } = await this.findAll({
        owner,
        action: 'findAll',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Contact Us');

      worksheet.addRow(['Sl. No', 'Name', 'Email', 'Message', 'Created On']);

      const contact_us: ContactUs[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        contact_us.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x.email,
            x?.message,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Created On', key: 'created_at', width: 25 },
      ];

      const folder = 'contact-us-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Contact-Us.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!contact_us.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
}
