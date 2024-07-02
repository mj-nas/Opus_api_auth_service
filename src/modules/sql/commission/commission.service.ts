import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Op, literal } from 'sequelize';
import { JobResponse } from 'src/core/core.job';
import { OrderItemStatus } from '../order-item/entities/order-item.entity';
import { OrderStatus } from '../order/order-status.enum';
import { OrderService } from '../order/order.service';
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
}
