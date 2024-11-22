import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { GalleryService } from '../gallery/gallery.service';
import { GalleryCategory } from './entities/gallery-category.entity';

@Injectable()
export class GalleryCategoryService extends ModelService<GalleryCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<GalleryCategory>,
    private galleryService: GalleryService,
  ) {
    super(db);
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeDelete(job: SqlJob<GalleryCategory>): Promise<void> {
    await super.doBeforeDelete(job);
    try {
      /**check if any gallery in this category */
      const products = (
        await this.galleryService.findAll({
          options: { where: { category_id: job.id } },
        })
      )?.data;
      if (products?.length)
        throw new Error(
          'Cannot delete this category since there are media files in this category.',
        );
    } catch (error) {
      throw error;
    }
  }

  async createGalleryCategoryXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('GalleryCategory');

      worksheet.addRow(['Sl. No', 'Title', 'Created On', 'Status']);

      const users: GalleryCategory[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Title', key: 'name', width: 25 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'gallery-category-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-GalleryCategoryManagement.xlsx`;
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
