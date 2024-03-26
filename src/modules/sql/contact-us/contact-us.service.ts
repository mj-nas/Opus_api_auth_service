import { ModelService, SqlJob, SqlService, WrapSqlJob } from '@core/sql';
import { ReadPayload } from '@core/sql/sql.decorator';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { BulkDeleteMode } from './bulk-delete-mode.enum';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService extends ModelService<ContactUs> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(db: SqlService<ContactUs>) {
    super(db);
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
          limit: 10000,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Contact Us');

      worksheet.addRow(['Sl. No', 'Name', 'Email', 'Message', 'Created At']);

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
        { header: 'Created At', key: 'created_at', width: 25 },
      ];

      const file_dir = config().cdnPath + '/contact-us-excel';
      const file_baseurl = config().cdnLocalURL + 'contact-us';

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
      console.log(error);
      return { error };
    }
  }
}
