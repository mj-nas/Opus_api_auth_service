import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { IncludeOptions } from 'sequelize';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { CouponUsedService } from '../coupon-used/coupon-used.service';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponService extends ModelService<Coupon> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'code'];

  constructor(
    db: SqlService<Coupon>,
    private msClient: MsClientService,
    private couponUsedService: CouponUsedService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<Coupon>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeDelete(job: SqlJob<Coupon>): Promise<void> {
    await super.doBeforeDelete(job);
    /**check if the coupon is used by user */
    const usedCoupon = (
      await this.couponUsedService.findOne({
        options: { where: { coupon_id: job.id } },
      })
    )?.data;
    if (usedCoupon) {
      throw new Error('Cannot delete coupon because it has been used.');
    } else {
      console.log('coupon is not used');
    }
  }

  /**
   * doBeforeRead
   * @function function will execute before findAll, getCount, findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeRead(job: SqlJob<Coupon>): Promise<void> {
    await super.doBeforeRead(job);
    const include = job.options.include
      ? (job.options.include as IncludeOptions[])
      : [];
    const coupon_used_me = include.findIndex(
      (x) => x.association === 'coupon_used_me',
    );
    if (coupon_used_me > -1) {
      if (!!job.owner?.id) {
        include[coupon_used_me].where = {
          ...include[coupon_used_me].where,
          user_id: job.owner.id,
        };
        include[coupon_used_me].required = false;
      } else {
        include.splice(coupon_used_me, 1);
      }
    }

    job.options.include = include;
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: SqlJob<Coupon>,
    response: SqlCreateResponse<Coupon>,
  ): Promise<void> {
    await super.doAfterCreate(job, response);

    if (job.action === 'create' && response.data.owner == 'Dispenser') {
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: response.data.user_id,
            template: 'coupon_added_dispenser',
            skipUserConfig: true,
            variables: {
              COUPON_CODE: response.data.code,
            },
          },
        }),
      );
    }
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
          limit: -1,
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
        'Redemption limit per person',
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
        {
          header: 'Redemption limit per person',
          key: 'discount_usage',
          width: 25,
        },
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
      return { error };
    }
  }

  async verifyCoupon(job: Job): Promise<JobResponse> {
    const { owner, payload } = job;
    console.log('payload', payload);
    const { error, data } = await this.findOne({
      owner,
      action: 'findOne',
      payload,
    });
    const current_date = new Date();
    const valid_to = new Date(data.valid_to);
    if (error) return { error };
    if (valid_to >= current_date) {
      return { data };
    } else {
      return { error: 'invalid code', message: 'Coupon is expired' };
    }
  }
}
