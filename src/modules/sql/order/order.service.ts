import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { StripeService } from '@core/stripe';
import { XpsService } from '@core/xps';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { getEnumKeyByValue } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { CouponUsedService } from '../coupon-used/coupon-used.service';
import { CouponOwner } from '../coupon/coupon-owner.enum';
import { CouponService } from '../coupon/coupon.service';
import { OrderAddressService } from '../order-address/order-address.service';
import { OrderItemStatus } from '../order-item/entities/order-item.entity';
import { OrderItemService } from '../order-item/order-item.service';
import { OrderPaymentService } from '../order-payment/order-payment.service';
import { OrderStatusLogService } from '../order-status-log/order-status-log.service';
import { SettingService } from '../setting/setting.service';
import { ConnectionVia } from '../user/connection-via.enum';
import { Role } from '../user/role.enum';
import { UserService } from '../user/user.service';
import { Order } from './entities/order.entity';
import { OrderStatus, OrderStatusLevel } from './order-status.enum';

@Injectable()
export class OrderService extends ModelService<Order> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['uid', '$user.name$'];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['user'];

  constructor(
    db: SqlService<Order>,
    private _orderAddressService: OrderAddressService,
    private _orderItemService: OrderItemService,
    private _orderStatusLogService: OrderStatusLogService,
    private _orderPaymentService: OrderPaymentService,
    private _sequelize: Sequelize,
    private _stripeService: StripeService,
    private _msClient: MsClientService,
    private _couponService: CouponService,
    private _userService: UserService,
    private _couponUsedService: CouponUsedService,
    private _xpsService: XpsService,
    private _config: ConfigService,
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
  protected async doBeforeFindAll(job: SqlJob<Order>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doBeforeFind
   * @function function will execute before findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFind(job: SqlJob<Order>): Promise<void> {
    await super.doBeforeFind(job);
    if (job.action === 'findOneMe') {
      job.options.where = { ...job.options.where, user_id: job.owner.id };
    }
  }

  /**
   * doBeforeUpdate
   * @function function will execute before update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeUpdate(job: SqlJob<Order>): Promise<void> {
    await super.doBeforeUpdate(job);
    if (
      job.action === 'cancelOrder' &&
      job.body.status === OrderStatus.Cancelled
    ) {
      const { error, data } = await this.$db.findRecordById({
        id: +job.id,
      });

      if (!!error) {
        throw error;
      }

      if (data.user_id !== job.owner.id) {
        throw "You don't have permission to change the status.";
      }

      if (data.status !== OrderStatus.PaymentPending) {
        throw "You can't cancel this order";
      }
    }

    if (job.action === 'cancelReorder') {
      const { error, data } = await this.$db.findRecordById({
        id: +job.id,
      });

      if (!!error) {
        throw error;
      }

      if (data.user_id !== job.owner.id) {
        throw "You don't have permission to change the status.";
      }
    }

    if (job.action === 'changeOrderStatus') {
      const { error, data } = await this.$db.findRecordById({
        id: +job.id,
      });

      if (!!error) {
        throw error;
      }

      if (
        OrderStatusLevel[getEnumKeyByValue(OrderStatus, job.body.status)] <=
        OrderStatusLevel[getEnumKeyByValue(OrderStatus, data.status)]
      ) {
        throw "You can't downgrade the order status";
      }
    }
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<Order>,
    response: SqlUpdateResponse<Order>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    if (
      job.action === 'order.status.update' ||
      job.action === 'cancelOrder' ||
      job.action === 'changeOrderStatus'
    ) {
      /**
       * @description Trigger the 'order-status-log.create' event for updating the order status log
       */
      await this._msClient.executeJob('order-status-log.create', {
        payload: {
          order_id: response.data.id,
          status: response.data.status,
        },
      });

      // Change order status from PaymentPending to Ordered
      if (
        response.previousData.status === OrderStatus.PaymentPending &&
        response.data.status === OrderStatus.Ordered
      ) {
        // Send order placed socket notification
        await this._msClient.executeJob('controller.socket-event', {
          action: 'orderPlaced',
          payload: {
            user_id: response.data.user_id,
            data: {
              order_id: response.data.uid,
            },
          },
        });

        // Send order confirmation mail notification
        await this._msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_id: response.data.user_id,
              template: 'order_confirm_to_customer',
              variables: {
                ORDER_ID: response.data.uid,
              },
            },
          }),
        );

        const order = await this.$db.findRecordById({
          id: response.data.id,
          options: {
            include: [
              {
                association: 'items',
                include: [
                  {
                    association: 'product',
                  },
                ],
              },
              { association: 'user' },
            ],
          },
        });

        const { items, user } = order.data;
        // const senderObj = {
        //   name: 'Albert Jones',
        //   company: 'Jones Co.',
        //   address1: '123 Some Street',
        //   address2: '#54',
        //   city: 'Holladay',
        //   state: 'UT',
        //   zip: '84117',
        //   country: 'US',
        //   phone: '8015042351',
        //   email: 'albert@jones.egg',
        // };
        // const packageWeight = items.reduce(
        //   (sum, item) => sum + item.product.weight_lbs,
        //   0,
        // );
        //ship product
        try {
          await this._xpsService.createShipment({
            payload: {
              orderId: response.data.uid,
              orderDate: moment(response.data.updated_at).format('YYYY-MM-DD'),
              orderNumber: null,
              fulfillmentStatus: 'pending',
              shippingService: null,
              shippingTotal: null,
              weightUnit: 'lb',
              dimUnit: 'in',
              dueByDate: null,
              orderGroup: null,
              contentDescription: `Order #${response.data.uid} from ${user.name}`,
              sender: this._config.get('xpsSender'),
              receiver: {
                name: user.name,
                address1: user.address,
                company: '',
                address2: '',
                city: user.city,
                state: user.state,
                zip: user.zip_code,
                country: 'US',
                phone: user.phone,
                email: user.email,
              },
              items: items.map((item) => ({
                productId: item.product.id.toString(),
                sku: item?.product.slug,
                title: item.product?.product_name,
                price: item?.price.toString(),
                quantity: item?.quantity,
                weight: item.product?.weight_lbs.toString(),
                imgUrl: item.product?.product_image,
                htsNumber: null,
                countryOfOrigin: 'US',
                lineId: null,
              })),
              packages: items.map((item) => ({
                weight: item.product.weight_lbs.toString(),
                height: item.product.height.toString(),
                width: item.product.width.toString(),
                length: item.product.length.toString(),
                insuranceAmount: null,
                declaredValue: null,
              })),
            },
          });
        } catch (error) {
          console.log('Error while creating shipment', error);
          console.error(error);
        }
      }

      if (response.previousData.status !== response.data.status) {
        // Send order placed socket notification
        await this._msClient.executeJob('controller.socket-event', {
          action: 'orderStatusChange',
          payload: {
            user_id: response.data.user_id,
            data: {
              order_id: response.data.uid,
            },
          },
        });
      }
    }
  }

  async createOrder(job: Job): Promise<JobResponse> {
    const transaction = await this._sequelize.transaction();
    try {
      const { body } = job.payload;

      // Create a new order
      const order = await this.create({
        owner: job.owner,
        action: 'create',
        body: {
          ...body,
          user_id: job.owner.id,
          is_base_order: body.is_repeating_order === 'Y' ? 'Y' : 'N',
          status: OrderStatus.PaymentPending,
          dispenser_id: job.owner.dispenser_id || null,
        },
        options: {
          transaction,
        },
      });
      if (!!order.error) {
        await transaction.rollback();
        return { error: order.error };
      }

      // Create a new order address
      const address = await this._orderAddressService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          ...body.address,
        },
        options: {
          transaction,
        },
      });
      if (!!address.error) {
        await transaction.rollback();
        return { error: address.error };
      }

      // Loop through the products
      const items = body.items;
      for await (const item of items) {
        // Create a order product
        const itemCreate = await this._orderItemService.create({
          owner: job.owner,
          action: 'create',
          body: {
            order_id: order.data.id,
            ...item,
          },
          options: {
            transaction,
          },
        });
        if (!!itemCreate.error) {
          await transaction.rollback();
          return { error: itemCreate.error };
        }
      }

      // Create order status log
      const status = await this._orderStatusLogService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          status: OrderStatus.PaymentPending,
        },
        options: {
          transaction,
        },
      });
      if (!!status.error) {
        await transaction.rollback();
        return { error: status.error };
      }

      // Create a new stripe product against the order
      const product = await this._stripeService.stripe.products.create({
        name: order.data.uid,
        metadata: {
          order_id: order.data.id,
        },
      });

      // Create a new stripe price for the order
      const unit_amount = parseFloat(
        (order.data.total * 100).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        }),
      );
      const price = await this._stripeService.stripe.prices.create({
        currency: 'usd',
        unit_amount,
        product: product.id,
      });

      // Create a stripe payment link for the order
      const paymentLink = await this._stripeService.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
      });

      // Create order payment
      const payment = await this._orderPaymentService.create({
        owner: job.owner,
        action: 'create',
        body: {
          order_id: order.data.id,
          payment_link: paymentLink.id,
          payment_link_url: paymentLink.url,
        },
        options: {
          transaction,
        },
      });
      if (!!payment.error) {
        await transaction.rollback();
        return { error: payment.error };
      }

      if (!!body.coupon_id) {
        await this._couponUsedService.create({
          owner: job.owner,
          body: { user_id: job.owner.id, coupon_id: body.coupon_id },
        });
        const couponData = await this._couponService.findById({
          action: 'findById',
          id: body.coupon_id,
          options: { allowEmpty: true },
        });
        if (
          !couponData.error &&
          couponData.data !== null &&
          couponData.data?.owner === CouponOwner.Dispenser &&
          couponData.data?.user_id
        ) {
          const userData = await this._userService.findById({
            action: 'connectingToDispenser',
            id: +job.owner.id,
          });
          if (
            !userData.error &&
            userData.data !== null &&
            !userData.data?.dispenser_id
          ) {
            userData.data.setDataValue(
              'dispenser_id',
              couponData.data?.user_id,
            );
            userData.data.setDataValue('connection_via', ConnectionVia.Coupon);
            await userData.data.save();
          }
        }
      }

      await transaction.commit();

      // New order alert to admin
      await this._msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_where: { role: Role.Admin },
            template: 'new_order_alert_to_admin',
            variables: {
              ORDER_ID: order.data.uid,
              CUSTOMER_NAME: job.owner.name,
            },
          },
        }),
      );
      return { data: { order: order.data, payment_link: paymentLink.url } };
    } catch (error) {
      await transaction.rollback();
      return { error };
    }
  }

  async reorderCron(): Promise<JobResponse> {
    try {
      const { data, error } = await this.$db.getAllRecords({
        action: 'reorderCron',
        options: {
          limit: -1,
          where: {
            is_repeating_order: 'Y',
            is_base_order: 'Y',
            created_at: literal(
              `DATE_FORMAT(DATE_ADD(Order.created_at, INTERVAL repeating_days DAY ),'%Y-%M-%d') = DATE_FORMAT(CURDATE( ),'%Y-%M-%d')`,
            ),
          },
          include: [
            { association: 'address' },
            {
              association: 'items',
              separate: true,
              include: [
                {
                  association: 'product',
                  where: { active: true, status: 'Y' },
                  required: true,
                },
              ],
            },
            { association: 'user', where: { active: true }, required: true },
          ],
        },
      });
      if (!!error) {
        return { error };
      }

      const orders = data;

      const { data: shippingLimitData } = await this._settingService.findOne({
        action: 'findOne',
        payload: { where: { name: 'shipping_limit' } },
      });

      const { data: shippingPriceData } = await this._settingService.findOne({
        action: 'findOne',
        payload: { where: { name: 'shipping_price' } },
      });

      for await (const o of orders) {
        const orderJson = o.toJSON();
        const items = orderJson.items;
        const addressJson = orderJson.address;
        if (!items.length) continue;
        const sub_total = items.reduce((sum, item) => {
          const price =
            o.user?.role === Role.Dispenser
              ? item?.quantity * item?.product?.wholesale_price
              : item?.quantity * item?.product?.product_price;
          return sum + price;
        }, 0);
        const shipping_price =
          sub_total < Number(shippingLimitData?.value) &&
          o.user?.role !== Role.Dispenser
            ? Number(shippingPriceData?.value)
            : 0;

        const { data: taxData } = await this.getTaxRate({
          payload: { postalCode: addressJson?.shipping_zip_code },
        });
        const totalTax =
          o.user?.role === Role.Dispenser ? 0 : Number(taxData?.totalRate || 0);

        const tax = (totalTax * sub_total).toFixed(2);

        const total =
          sub_total + (shipping_price || 0) + (tax ? Number(tax) : 0);

        console.log({ totalTax, tax, total, shipping_price });
        const transaction = await this._sequelize.transaction();
        // Create a new order
        const order = await this.create({
          action: 'create',
          body: {
            cart_id: o.cart_id,
            sub_total,
            shipping_price: shipping_price || 0,
            tax: tax,
            total,
            is_a_reorder: 'Y',
            is_repeating_order: 'Y',
            repeating_days: o.repeating_days,
            is_base_order: 'Y',
            user_id: o.user_id,
            parent_order_id: o.parent_order_id ?? o.id,
            previous_order_id: o.id,
            status: OrderStatus.PaymentPending,
            dispenser_id: o.dispenser_id || null,
          },
          options: {
            transaction,
          },
        });
        if (!!order.error) {
          await transaction.rollback();
          return { error: order.error };
        }

        // Create a new order address
        delete addressJson.id;
        const address = await this._orderAddressService.create({
          action: 'create',
          body: {
            ...addressJson,
            order_id: order.data.id,
          },
          options: {
            transaction,
          },
        });
        if (!!address.error) {
          await transaction.rollback();
          return { error: address.error };
        }

        // Loop through the products
        for await (const item of items) {
          delete item.id;
          // Create a order product
          const itemCreate = await this._orderItemService.create({
            action: 'create',
            body: {
              ...item,
              price:
                o.user?.role === Role.Dispenser
                  ? item?.quantity * item?.product?.wholesale_price
                  : item?.quantity * item?.product?.product_price,
              price_per_item:
                o.user?.role === Role.Dispenser
                  ? item?.product?.wholesale_price
                  : item?.product?.product_price,
              status: OrderItemStatus.Ordered,
              order_id: order.data.id,
            },
            options: {
              transaction,
            },
          });
          if (!!itemCreate.error) {
            await transaction.rollback();
            return { error: itemCreate.error };
          }
        }

        // Create order status log
        const status = await this._orderStatusLogService.create({
          action: 'create',
          body: {
            order_id: order.data.id,
            status: OrderStatus.PaymentPending,
          },
          options: {
            transaction,
          },
        });
        if (!!status.error) {
          await transaction.rollback();
          return { error: status.error };
        }

        // Create a new stripe product against the order
        const product = await this._stripeService.stripe.products.create({
          name: order.data.uid,
          metadata: {
            order_id: order.data.id,
          },
        });

        // Create a new stripe price for the order
        const unit_amount = parseFloat(
          (order.data.total * 100).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
        );
        const price = await this._stripeService.stripe.prices.create({
          currency: 'usd',
          unit_amount,
          product: product.id,
        });

        // Create a stripe payment link for the order
        const paymentLink =
          await this._stripeService.stripe.paymentLinks.create({
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
          });

        // Create order payment
        const payment = await this._orderPaymentService.create({
          action: 'create',
          body: {
            order_id: order.data.id,
            payment_link: paymentLink.id,
            payment_link_url: paymentLink.url,
          },
          options: {
            transaction,
          },
        });
        if (!!payment.error) {
          await transaction.rollback();
          return { error: payment.error };
        }

        await transaction.commit();

        o.setDataValue('is_base_order', 'N');
        await o.save();

        // New order alert to admin
        await this._msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_where: { role: Role.Admin },
              template: 'new_order_alert_to_admin',
              variables: {
                ORDER_ID: order.data.uid,
                CUSTOMER_NAME: o.user.name,
              },
            },
          }),
        );
      }

      return { data };
    } catch (error) {
      console.error(error);
      return { error };
    }
  }

  async reorderNotificationCron(): Promise<JobResponse> {
    try {
      const { data, error } = await this.$db.getAllRecords({
        action: 'reorderCron',
        options: {
          limit: -1,
          where: {
            is_repeating_order: 'Y',
            is_base_order: 'Y',
            created_at: literal(
              `DATE_FORMAT(DATE_ADD(Order.created_at, INTERVAL repeating_days - 2 DAY ),'%Y-%M-%d') = DATE_FORMAT(CURDATE( ),'%Y-%M-%d')`,
            ),
          },
          include: [
            { association: 'address' },
            {
              association: 'items',
              separate: true,
              include: [
                {
                  association: 'product',
                  where: { active: true, status: 'Y' },
                  required: true,
                },
              ],
            },
            { association: 'user', where: { active: true }, required: true },
          ],
        },
      });
      if (!!error) {
        return { error };
      }

      const orders = data;
      for await (const o of orders) {
        const orderJson = o.toJSON();
        const items = orderJson.items;
        if (!items.length) continue;
        // New order alert to admin
        await this._msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_id: o.user_id,
              template: 'repeat_order_reminder',
              variables: {
                ORDER_ID: o.uid,
                REPEAT_DATE: moment().add(2, 'days').format('MM/DD/YYYY'),
                ORDER_PAGE_LINK: `${process.env.WEBSITE_URL}/profile/orders/detail/${o.uid}`,
              },
            },
          }),
        );
      }

      return { data };
    } catch (error) {
      console.error(error);
      return { error };
    }
  }

  async reorder(job: Job): Promise<JobResponse> {
    try {
      const { order_id, repeating_days } = job.payload;
      const { error, data } = await this.$db.findRecordById({
        id: order_id,
        options: {
          where: { user_id: job.owner.id },
        },
      });
      if (!!error) {
        return { error };
      }
      const nextRepeatingDay = moment(data.created_at).add(
        repeating_days,
        'days',
      );
      const currentDate = moment();
      if (!nextRepeatingDay.isAfter(currentDate)) {
        const daysDifference = currentDate.diff(
          moment(data.created_at),
          'days',
        );
        return {
          error: `Repeating days must be greater than ${daysDifference + 1}.`,
        };
      }

      if (job.action === 'reorder') {
        data.setDataValue('is_repeating_order', 'Y');
        data.setDataValue('is_base_order', 'Y');
      }

      data.setDataValue('repeating_days', repeating_days);
      await data.save();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async createXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Orders');

      worksheet.addRow([
        'Sl. No',
        'Order ID',
        'Customer Name',
        'Price',
        'Repeated Days',
        'Order Date',
        'Status',
      ]);

      const orders: Order[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        orders.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.uid,
            x?.user?.name,
            `${x?.total}`,
            x?.repeating_days,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'uid', width: 25 },
        { header: 'Customer Name', key: 'name', width: 25 },
        { header: 'Price', key: 'total', width: 10 },
        { header: 'Repeated Days', key: 'repeating_days', width: 10 },
        { header: 'Order Date', key: 'created_at', width: 50 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'order-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Order.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!orders.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async createReorderXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Reorders');

      worksheet.addRow([
        'Sl. No',
        'Order ID',
        'Customer Name',
        'Price',
        'Repeated Days',
        'Next Order Date',
        'Previous Order Date',
        'Status',
      ]);

      const orders: Order[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        orders.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.uid,
            x?.user?.name,
            `${x?.total}`,
            x?.repeating_days,
            moment(x.created_at)
              .add(x?.repeating_days, 'days')
              .tz(timezone)
              .format('MM/DD/YYYY hh:mm A'),
            moment(x.previous_order.created_at)
              .tz(timezone)
              .format('MM/DD/YYYY hh:mm A'),
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'uid', width: 25 },
        { header: 'Customer Name', key: 'name', width: 25 },
        { header: 'Price', key: 'total', width: 10 },
        { header: 'Repeated Days', key: 'repeating_days', width: 10 },
        { header: 'Next Order Date', key: 'created_at', width: 50 },
        { header: 'Previous Order Date', key: 'previous_order', width: 50 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'order-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Reorder.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!orders.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async reCheckStatus(job: Job): Promise<JobResponse> {
    try {
      const { order_id } = job.payload;
      const { error, data } = await this.findById({
        action: 'findById',
        id: +order_id,
        payload: { populate: ['items'] },
      });
      if (!error && data !== null) {
        const items = data.items;
        const orderedItems = items.filter(
          (item) => item.status === OrderItemStatus.Ordered,
        );
        if (orderedItems.length === 0) {
          await this._msClient.executeJob('order.status.update', {
            payload: {
              order_id,
              status: OrderStatus.Cancelled,
            },
          });
        }
      }
    } catch (error) {
      return { error };
    }
  }

  async getTaxRate(job: Job): Promise<JobResponse> {
    try {
      const { postalCode } = job.payload;
      const avlaraurl = `https://rest.avatax.com/api/v2/taxrates/bypostalcode?country=US&postalCode=${postalCode}`;
      const response = await axios.get(avlaraurl, {
        headers: {
          Authorization: `Basic ${process.env.AVALARA_CLIENT_ID}`,
        },
      });
      return { data: response.data };
    } catch (error) {
      return { error };
    }
  }
}
