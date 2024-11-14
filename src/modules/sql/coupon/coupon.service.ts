import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { IncludeOptions, Op } from 'sequelize';
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
  searchFields: string[] = [
    'name',
    'code',
    'discount_usage',
    'discount',
    '$user.name$',
  ];

  // searchPopulate: string[] = ['user'];

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
    const date = new Date().toISOString().split('T')[0];
    console.log(job.options.where);

    if (job.options?.where && 'deleted_at' in job.options.where) {
      job.options.paranoid = false;
    }
    if (
      job.options?.where[Symbol.for('or')] &&
      job.options.where[Symbol.for('or')][0].deleted_at
    ) {
      job.options.paranoid = false;
    }
    if (job.action === 'findAllMe') {
      job.options.where = {
        ...job.options.where,
        user_id: job.owner.id,
        active: true,
        valid_to: { [Op.gte]: date },
        valid_from: { [Op.lte]: date },
      };
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
              DISCOUNT: `${response.data.coupon_type == 'price' ? `$${parseFloat(response.data.discount).toFixed(2)}` : `${parseFloat(response.data.discount).toFixed(2)}%`}`,
              VALIDITY: `${moment(response.data.valid_from).format('MM/DD/YYYY')} - ${moment(response.data.valid_to).format('MM/DD/YYYY')}`,
              USE: response.data.discount_usage,
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
      console.log('payload', payload);

      const { error, data } = await this.findAll({
        owner,
        action: 'findAll',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
          populate: ['user', '-coupon_used'],
        },
      });
      console.log('data', data);

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Coupons');

      worksheet.addRow([
        'Sl. No',
        'Coupon Name',
        'Code',
        'Dispenser',
        'Start Date',
        'End Date',
        'Price/Percentage',
        'Discount Type',
        'Redemption limit per person',
        'Redemption Status',
        'Activation Status',
      ]);

      const coupons: Coupon[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        coupons.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x?.code,
            x?.user?.name,
            moment(x.valid_from).format('MM/DD/YYYY'),
            moment(x.valid_to).format('MM/DD/YYYY'),
            x?.coupon_type === 'percentage'
              ? `${parseFloat(x.discount).toFixed(2)}%`
              : `$${parseFloat(x.discount).toFixed(2)}`,
            x?.coupon_type == 'percentage' ? 'Percentage' : 'Price',
            x?.discount_usage,
            x?.coupon_used.length > 0 ? 'Redeemed' : 'Not Redeemed',
            x.deleted_at ? 'Deleted' : x.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Coupon Name', key: 'name', width: 25 },
        { header: 'Code', key: 'code', width: 25 },
        { header: 'Dispenser', key: 'user', width: 25 },
        { header: 'Start Date', key: 'valid_from', width: 25 },
        { header: 'End Date', key: 'valid_to', width: 50 },
        { header: 'Price/Percentage', key: 'percentage', width: 25 },
        { header: 'Discount Type', key: 'coupon_type', width: 25 },
        {
          header: 'Redemption limit per person',
          key: 'discount_usage',
          width: 25,
        },
        { header: 'Redemption Status', key: 'coupon_used', width: 25 },
        { header: 'Activation Status', key: 'active', width: 25 },
      ];

      const file_dir = config().cdnPath + '/coupon-excel';
      const file_baseurl = config().cdnLocalURL + 'coupon-excel';

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `DispenserCoupons.xlsx`;
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
  async exportGeneralXls(job: Job): Promise<JobResponse> {
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
          populate: ['user', '-coupon_used'],
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('GeneralCoupons');

      worksheet.addRow([
        'Sl. No',
        'Name',
        'Code',
        'Start Date',
        'End Date',
        'Price/Percentage',
        'Discount Type',
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
              : `$${parseFloat(x.discount).toFixed(2)}`,
            x?.coupon_type == 'percentage' ? 'Percentage' : 'Price',
            x?.discount_usage,
            x?.description,
            x.deleted_at ? 'Deleted' : x.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Code', key: 'code', width: 25 },
        { header: 'Start Date', key: 'valid_from', width: 25 },
        { header: 'End Date', key: 'valid_to', width: 50 },
        { header: 'Price/Percentage', key: 'percentage', width: 25 },
        { header: 'Discount Type', key: 'coupon_type', width: 25 },
        {
          header: 'Use Per Person',
          key: 'discount_usage',
          width: 25,
        },
        { header: 'Description', key: 'description', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const file_dir = config().cdnPath + '/general-coupon-excel';
      const file_baseurl = config().cdnLocalURL + 'general-coupon-excel';

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `GeneralCoupons.xlsx`;
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
    const { error, data } = await this.findOne({
      owner,
      action: 'findOne',
      payload: {
        where: {
          ...payload.where,
          active: true,
        },
        populate: ['user', 'coupon_used_me'],
      },
    });
    if (error) return { error };
    const current_date = new Date().toISOString().split('T')[0];
    const valid_till = new Date(data.valid_to).toISOString().split('T')[0];
    const valid_from = new Date(data.valid_from).toISOString().split('T')[0];

    if (valid_from <= current_date) {
      if (valid_till >= current_date) {
        return { data };
      } else {
        return {
          error: 'invalid code',
          message: 'Coupon is expired',
        };
      }
    } else {
      return { error: 'invalid code', message: 'Coupon is not available yet' };
    }
  }
}
