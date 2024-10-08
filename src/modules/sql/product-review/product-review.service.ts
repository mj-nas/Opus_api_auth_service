import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { ProductReview } from './entities/product-review.entity';

@Injectable()
export class ProductReviewService extends ModelService<ProductReview> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [
    'review',
    '$user.name$',
    '$product.product_name$',
    'rating',
  ];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['user', 'product'];

  constructor(
    db: SqlService<ProductReview>,
    private _msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<ProductReview>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllReviews') {
      job.options.where = {
        ...job.options.where,
        status: 'Approved',
      };
    }
  }

  async createReview(job: Job) {
    try {
      const { body } = job.payload;
      const { error, data } = await this.$db.findOrCreate({
        owner: job.owner,
        action: 'findOrCreate',
        body: body,
        options: {
          where: {
            order_id: body.order_id,
            product_id: body.product_id,
            created_by: job.owner.id,
          },
        },
      });
      if (!!error) {
        return { error };
      }

      await this._msClient.executeJob('product.review.create', {
        payload: {
          product_id: body.product_id,
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async exportRating(job: Job): Promise<JobResponse> {
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
        'Product',
        'Name',
        'Rating',
        'Review',
        'Posted On',
        'Status',
      ]);

      const ratings: ProductReview[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        ratings.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.product?.product_name,
            x?.user?.name,
            x.rating,
            x.review,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Product', key: 'product', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Rating', key: 'rating', width: 25 },
        { header: 'Review', key: 'review', width: 25 },
        { header: 'Posted On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'rating-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `ratings.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!ratings.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
}
