import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponService extends ModelService<Coupon> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Coupon>) {
    super(db);
  }

  async createXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
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
      const worksheet = workbook.addWorksheet('Coupons');

      worksheet.addRow([
        'Sl. No',
        'Name',
        'Code',
        'Start Date',
        'End Date',
        'Price/Percentage',
        'Use Per Person',
        'Description',
        'Status',
      ]);

      const coupons: Coupon[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        coupons.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x?.code,
            moment(x.valid_from).format('MM/DD/YYYY'),
            moment(x.valid_to).format('MM/DD/YYYY'),
            x?.coupon_type === 'percentage'
              ? `${x.discount}%`
              : `$${x.discount}`,
            x?.discount_usage,
            x?.description,
            x.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'product_name', width: 25 },
        { header: 'Code', key: 'code', width: 25 },
        { header: 'Start Date', key: 'valid_from', width: 25 },
        { header: 'End Date', key: 'valid_to', width: 50 },
        { header: 'Price/Percentage', key: 'percentage', width: 25 },
        { header: 'Use Per Person', key: 'discount_usage', width: 25 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const file_dir = config().cdnPath + '/coupon-excel';
      const file_baseurl = config().cdnLocalURL + 'coupon-excel';

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Coupons.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!coupons.length,
        },
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
