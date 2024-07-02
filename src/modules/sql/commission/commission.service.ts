import { ModelService, SqlJob, SqlService, WrapSqlJob } from '@core/sql';
import { ReadPayload } from '@core/sql/sql.decorator';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import moment from 'moment-timezone';
import { Op, col, fn, literal } from 'sequelize';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { OrderItemStatus } from '../order-item/entities/order-item.entity';
import { OrderStatus } from '../order/order-status.enum';
import { OrderService } from '../order/order.service';
import { CommissionStatus } from './commission-status.enum';
import { Commission } from './entities/commission.entity';

@Injectable()
export class CommissionService extends ModelService<Commission> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['$order.uid$', '$user.name$'];

  constructor(
    db: SqlService<Commission>,
    private _orderService: OrderService,
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
              [fn('ROUND', fn('SUM', col('commission')), 1), 'total_earnings'],
            ],
            limit: undefined,
            offset: undefined,
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
              [fn('ROUND', fn('SUM', col('commission')), 1), 'total_paid'],
            ],
            limit: undefined,
            offset: undefined,
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
              [fn('ROUND', fn('SUM', col('commission')), 1), 'total_balance'],
            ],
            limit: undefined,
            offset: undefined,
          },
        }),
      ]);

      return {
        data: {
          ...total_earnings.toJSON(),
          ...total_paid.toJSON(),
          ...total_balance.toJSON(),
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
      return Math.floor((coupon_discount / 100) * sub_total * 100) / 100;
    } else {
      return Math.floor((sub_total - coupon_discount) * 100) / 100;
    }
  }

  async commissionCalculatorCron(): Promise<JobResponse> {
    try {
      const { data, error } = await this._orderService.$db.getAllRecords({
        action: 'commissionCalculator',
        options: {
          limit: -1,
          where: {
            status: OrderStatus.Delivered,
            '$current_status.created_at$': literal(
              `DATE_FORMAT(DATE_ADD( current_status.created_at, INTERVAL 15 DAY ),'%Y-%M-%d') = DATE_FORMAT(CURDATE( ),'%Y-%M-%d')`,
            ),
            '$user.dispenser_id$': { [Op.ne]: null },
          },
          include: [
            { association: 'current_status' },
            { association: 'items' },
            { association: 'coupon' },
            { association: 'user' },
          ],
        },
      });
      if (!!error) {
        return { error };
      }

      const orders = data;
      for await (const order of orders) {
        if (!!order.user?.dispenser_id) {
          const items = order.items.filter(
            (item) => item.status === OrderItemStatus.Ordered,
          );
          const sub_total = items.reduce((sum, item) => sum + item.price, 0);
          let body: any = {
            order_id: order.id,
            user_id: order.user.dispenser_id,
            order_amount: sub_total,
            internal_fee: 10,
            commission_percentage: 20,
          };
          if (!!order.coupon_id) {
            body = {
              ...body,
              coupon_discount_amount: await this.calculateCouponAmount({
                coupon_type: order.coupon_type,
                sub_total,
                coupon_discount: order.coupon_discount,
              }),
            };
          }
          await this.create({ body });
        }
      }
      return { data: orders };
    } catch (error) {
      return { error };
    }
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
          populate: ['user'],
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Commission');

      worksheet.addRow([
        'Sl. No',
        'Order ID',
        'Order By',
        'Date',
        'Order Amount',
        'Commission',
        'Commission Status',
      ]);

      const commissions: Commission[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        commissions.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.order_id,
            x?.user?.name,
            moment(x.created_at).tz(timezone).format('MMM dd yyyy'),
            x.created_at,
            x?.order_amount,
            x?.commission,
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'order_id', width: 25 },
        { header: 'Order By', key: 'order_by', width: 25 },
        { header: 'Date', key: 'date', width: 25 },
        { header: 'Order Amount', key: 'order_amount', width: 25 },
        { header: 'Commission', key: 'commission', width: 25 },
        { header: 'Commission Status', key: 'commission_status', width: 25 },
      ];

      const folder = 'commission-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Commission.xlsx`;
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
}
