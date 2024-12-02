import { ModelService, SqlJob, SqlService, WrapSqlJob } from '@core/sql';
import { ReadPayload } from '@core/sql/sql.decorator';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { Op, col, fn, literal } from 'sequelize';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { BulkDeleteMode } from '../contact-us/bulk-delete-mode.enum';
import { OrderItemStatus } from '../order-item/entities/order-item.entity';
import { OrderStatus } from '../order/order-status.enum';
import { OrderService } from '../order/order.service';
import { SettingService } from '../setting/setting.service';
import { CommissionStatus } from './commission-status.enum';
import { Commission } from './entities/commission.entity';

@Injectable()
export class CommissionService extends ModelService<Commission> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [
    '$order.uid$',
    '$order.user.name$',
    '$user.name$',
    'commission',
    'order_amount',
  ];

  constructor(
    db: SqlService<Commission>,
    private _orderService: OrderService,
    private _settingService: SettingService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<Commission>): Promise<void> {
    await super.doBeforeFindAll(job);
    // find all my commissions
    if (job.action === 'findAllMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  @WrapSqlJob
  @ReadPayload
  async getAllCounts(job: SqlJob<Commission>): Promise<JobResponse> {
    try {
      if (job.action === 'findAllMe') {
        job.options.where = { ...job.options.where, user_id: job.owner.id };
      }

      const [
        { data: total_earnings },
        { data: total_paid },
        { data: total_balance },
      ] = await Promise.all([
        await this.$db.findOneRecord({
          options: {
            ...job.options,
            where: {
              ...job.options.where,
              status: {
                [Op.in]: [CommissionStatus.Paid, CommissionStatus.Pending],
              },
            },
            attributes: [
              [fn('ROUND', fn('SUM', col('commission')), 2), 'total_earnings'],
            ],
            limit: undefined,
            offset: undefined,
            include: [
              {
                association: 'order',
                attributes: ['uid'],
                include: [{ association: 'user' }],
              },
              { association: 'user', attributes: ['name'] },
            ],
          },
        }),
        await this.$db.findOneRecord({
          options: {
            ...job.options,
            where: {
              ...job.options.where,
              status: {
                [Op.in]: [CommissionStatus.Paid],
              },
            },
            attributes: [
              [fn('ROUND', fn('SUM', col('commission')), 2), 'total_paid'],
            ],
            limit: undefined,
            offset: undefined,
            include: [
              {
                association: 'order',
                attributes: ['uid'],
                include: [{ association: 'user' }],
              },
              { association: 'user', attributes: ['name'] },
            ],
          },
        }),
        await this.$db.findOneRecord({
          options: {
            ...job.options,
            where: {
              ...job.options.where,
              status: {
                [Op.in]: [CommissionStatus.Pending],
              },
            },
            attributes: [
              [fn('ROUND', fn('SUM', col('commission')), 2), 'total_balance'],
            ],
            limit: undefined,
            offset: undefined,
            include: [
              {
                association: 'order',
                attributes: ['uid'],
                include: [{ association: 'user' }],
              },
              { association: 'user', attributes: ['name'] },
            ],
          },
        }),
      ]);
      return {
        data: {
          total_earnings: total_earnings?.dataValues?.total_earnings || 0,
          total_paid: total_paid?.dataValues?.total_paid || 0,
          total_balance: total_balance?.dataValues?.total_balance || 0,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async calculateCouponAmount({
    sub_total,
    coupon_type,
    coupon_discount,
  }: {
    sub_total: number;
    coupon_type: string;
    coupon_discount: number;
  }) {
    if (coupon_type === 'percentage') {
      return Math.round((coupon_discount / 100) * sub_total * 100) / 100;
    } else {
      return Math.round(coupon_discount * 100) / 100;
    }
  }

  async bulkUpdate(job: SqlJob<Commission>): Promise<JobResponse> {
    try {
      const { body, payload } = job;
      if (body?.mode === BulkDeleteMode.All) {
        delete payload.limit;
        delete payload.offset;
        const { error, data } = await this.allUpdate({
          payload,
          body,
        });
        if (error) return { error };
        return { data };
      }

      const { error, data } = await this.$db.updateBulkRecords({
        owner: job.owner,
        body: { status: body.status },
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

  @WrapSqlJob
  @ReadPayload
  async allUpdate(job: SqlJob<Commission>): Promise<JobResponse> {
    try {
      const { options, body } = job;
      const startOfCurrentMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );

      const { error: orderError, data: orderData } =
        await this.$db.getAllRecords({
          options: {
            ...options,
            where: {
              ...options.where,
              status: CommissionStatus.Pending,
              '$order.status$': OrderStatus.Delivered,
              '$order.created_at$': { [Op.lt]: startOfCurrentMonth },
            },
          },
        });
      if (orderError) {
        return { error: orderError };
      }

      const { error, data } = await this.$db.updateBulkRecords({
        options: {
          where: {
            id: { [Op.in]: orderData.map((e) => e.id) },
          },
        },
        body: { status: body.status },
      });
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }

  // async commissionCalculatorCron(): Promise<JobResponse> {
  //   try {
  //     const { data, error } = await this._orderService.$db.getAllRecords({
  //       action: 'commissionCalculator',
  //       options: {
  //         limit: -1,
  //         where: {
  //           status: {
  //             [Op.in]: [OrderStatus.Delivered, OrderStatus.Cancelled],
  //           },
  //           '$current_status.created_at$': literal(
  //             `DATE_FORMAT(DATE_ADD( current_status.created_at, INTERVAL 15 DAY ),'%Y-%m-%d') = DATE_FORMAT(CURDATE( ),'%Y-%m-%d')`,
  //           ),
  //         },
  //         include: [
  //           { association: 'current_status' },
  //           { association: 'items', separate: true },
  //           { association: 'coupon' },
  //           { association: 'user' },
  //           {
  //             association: 'dispenser',
  //             where: { active: true },
  //             required: true,
  //           },
  //         ],
  //       },
  //     });
  //     if (!!error) {
  //       return { error };
  //     }

  //     const { data: internalFeeData } = await this._settingService.findOne({
  //       action: 'findOne',
  //       payload: { where: { name: 'minus_price' } },
  //     });

  //     const { data: commissionData } = await this._settingService.findOne({
  //       action: 'findOne',
  //       payload: { where: { name: 'commission' } },
  //     });

  //     const orders = data;
  //     console.log(orders);
  //     console.log(orders.length);
  //     for await (const order of orders) {
  //       if (!!order?.dispenser_id) {
  //         const items = order.items.filter(
  //           (item) => item.status === OrderItemStatus.Ordered,
  //         );
  //         const sub_total = items.reduce((sum, item) => sum + item.price, 0);
  //         let body: any = {
  //           order_id: order.id,
  //           user_id: order.dispenser_id,
  //           order_amount:
  //             order.status === OrderStatus.Cancelled ? 0 : sub_total,
  //           internal_fee: internalFeeData.value || 0,
  //           commission_percentage: commissionData.value || 0,
  //           status:
  //             order.status === OrderStatus.Cancelled
  //               ? CommissionStatus.Cancelled
  //               : CommissionStatus.Pending,
  //         };
  //         if (!!order.coupon_id) {
  //           body = {
  //             ...body,
  //             coupon_discount_amount: await this.calculateCouponAmount({
  //               coupon_type: order.coupon_type,
  //               sub_total,
  //               coupon_discount: order.coupon_discount,
  //             }),
  //           };
  //         }
  //         await this.create({ body });
  //       }
  //     }
  //     return { data: orders };
  //   } catch (error) {
  //     return { error };
  //   }
  // }
  async calculateCommission(order_id: number): Promise<JobResponse> {
    const { data, error } = await this._orderService.$db.findOneRecord({
      options: {
        where: {
          id: +order_id,
        },
        include: [
          { association: 'items', separate: true },
          { association: 'coupon' },
          { association: 'user' },
          {
            association: 'dispenser',
            where: { active: true },
            required: true,
          },
        ],
      },
    });

    if (error) {
      return { error };
    }

    const { data: internalFeeData } = await this._settingService.findOne({
      action: 'findOne',
      payload: { where: { name: 'minus_price' } },
    });

    const { data: commissionData } = await this._settingService.findOne({
      action: 'findOne',
      payload: { where: { name: 'commission' } },
    });

    if (!!data?.dispenser_id) {
      const items = data.items.filter(
        (item) => item.status === OrderItemStatus.Ordered,
      );
      const sub_total = items.reduce((sum, item) => sum + item.price, 0);
      let body: any = {
        order_id: data.id,
        user_id: data.dispenser_id,
        order_amount: data.status === OrderStatus.Cancelled ? 0 : sub_total,
        internal_fee: internalFeeData.value || 0,
        commission_percentage: commissionData.value || 0,
        status:
          data.status === OrderStatus.Cancelled
            ? CommissionStatus.Cancelled
            : CommissionStatus.Pending,
      };
      if (!!data.coupon_id) {
        body = {
          ...body,
          coupon_discount_amount: await this.calculateCouponAmount({
            coupon_type: data.coupon_type,
            sub_total,
            coupon_discount: data.coupon_discount,
          }),
        };
      }
      console.log(body);

      await this.create({ body });
    }

    return { data: data };
  }
  async createCommissionXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Commission');

      worksheet.addRow([
        'Sl. No',
        'Order ID',
        'Dispenser First Name',
        'Dispenser Last Name',
        'Ordered By',
        'Commission Date',
        'Order Date',
        'Order Amount',
        'Commission',
        'Order Status',
        'Commission Status',
      ]);

      const commissions: Commission[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        commissions.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.order?.uid,
            x?.user?.first_name,
            x?.user?.last_name,
            x?.order?.user?.name,
            moment(x.created_at).tz(timezone).format('MMM DD YYYY'),
            moment(x?.order?.created_at).tz(timezone).format('MMM DD YYYY'),
            `$${x.order_amount.toFixed(2)}`,
            `$${x?.commission.toFixed(2)}`,
            x?.order?.status,
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'order_id', width: 25 },
        { header: 'Dispenser First Name', key: 'dispenser_name', width: 25 },
        { header: 'Dispenser Last Name', key: 'dispenser_name', width: 25 },
        { header: 'Ordered By', key: 'ordered_by', width: 25 },
        { header: 'Commission Date', key: 'date', width: 25 },
        { header: 'Order Date', key: 'date', width: 25 },
        { header: 'Order Amount', key: 'order_amount', width: 25 },
        { header: 'Commission', key: 'commission', width: 25 },
        { header: 'Order Status', key: 'order_status', width: 25 },
        { header: 'Commission Status', key: 'commission_status', width: 25 },
      ];

      const folder = 'commission-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-CommissionReport.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!commissions.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
  async updateBulkStatus(job: SqlJob<Commission>): Promise<JobResponse> {
    try {
      const { owner, payload, body } = job;

      const { error, data } = await this.$db.updateBulkRecords({
        owner,
        action: 'updateBulk',
        options: {
          ...payload,
          limit: 1000,
        },
        body,
      });
      if (error) throw error;
      return { data };
    } catch (error) {
      return { error };
    }
  }
  async getAnyPending(): Promise<boolean> {
    const { data } = await this.$db.findOneRecord({
      action: 'findOne',
      options: {
        where: {
          status: CommissionStatus.Pending,
        },
        include: [
          {
            association: 'order',
            where: {
              created_at: literal(
                `DATE_FORMAT(order.created_at,'%Y-%m-%d') < DATE_FORMAT(CURDATE( ),'%Y-%m-01')`,
              ),
              status: OrderStatus.Delivered,
            },
            required: true,
          },
        ],
      },
    });
    if (!data) return false;
    return true;
  }
}
