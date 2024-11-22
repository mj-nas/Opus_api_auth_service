import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { Testimonials } from './entities/testimonials.entity';

@Injectable()
export class TestimonialsService extends ModelService<Testimonials> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'speciality'];

  constructor(db: SqlService<Testimonials>) {
    super(db);
  }

  async getHomePageTestimonials() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 10,
          order: [['created_at', 'desc']],
          where: { active: true },
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async createTestimonialsXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Testimonials');

      worksheet.addRow([
        'Sl. No',
        'Name',
        'Reference',
        'Quotes',
        'Created On',
        'Status',
      ]);

      const testimonials: Testimonials[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        testimonials.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x?.speciality,
            x?.quote,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY'),
            x?.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Reference', key: 'speciality', width: 25 },
        { header: 'Quotes', key: 'quote', width: 25 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'testimonials-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-Testimonials.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!testimonials.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
}
