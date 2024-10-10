import {
  ModelService,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { Gallery } from './entities/gallery.entity';

@Injectable()
export class GalleryService extends ModelService<Gallery> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Gallery>) {
    super(db);
  }

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<Gallery>,
  ): Promise<SqlCreateBulkResponse<Gallery>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: Gallery[] = [];
    for (let index = 0; index < job.records.length; index++) {
      const record = job.records[index];
      const response = await this.update({
        owner: job.owner,
        action: 'update',
        id: record.id,
        body: record,
        options: {
          fields: ['sort'],
        },
      });
      productSort.push(response.data);
    }
    return { data: productSort };
  }

  async createGalleryXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Gallery');

      worksheet.addRow([
        'Sl. No',
        'Title',
        `${payload.where?.type === 'image' ? 'Image' : 'Video'}`,
        'Category',
        'Created On',
        'Status',
      ]);

      const users: Gallery[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x?.file_url,
            x?.category?.name,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Title', key: 'name', width: 25 },
        { header: 'Image', key: 'file_url', width: 25 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'gallery-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Gallery.xlsx`;
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
      return { error };
    }
  }
}
