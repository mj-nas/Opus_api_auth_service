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
import { LearnArticle } from './entities/learn-article.entity';

@Injectable()
export class LearnArticleService extends ModelService<LearnArticle> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['title'];

  constructor(db: SqlService<LearnArticle>) {
    super(db);
  }

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<LearnArticle>,
  ): Promise<SqlCreateBulkResponse<LearnArticle>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: LearnArticle[] = [];
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

  async createLearnArticleXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Customer');

      worksheet.addRow([
        'Sl. No',
        'Title',
        'Description',
        'URL',
        'Thumbnail',
        'Date',
        'Status',
      ]);

      const users: LearnArticle[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.title,
            x?.description,
            x?.url,
            x?.thumb,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Description', key: 'description', width: 25 },
        { header: 'URL', key: 'url', width: 25 },
        { header: 'Thumbnail', key: 'thumbnail', width: 25 },
        { header: 'Date', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'learn-article-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `LearnArticle.xlsx`;
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
