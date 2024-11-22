import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { StripeService } from '@core/stripe';
import { XpsService } from '@core/xps';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { handlebars } from 'hbs';
import * as moment from 'moment-timezone';
import { join } from 'path';
import { literal, Op } from 'sequelize';
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
import { ProductsService } from '../products/products.service';
import { SettingService } from '../setting/setting.service';
import { TemplateService } from '../template/template.service';
import { ConnectionVia } from '../user/connection-via.enum';
import { Role } from '../user/role.enum';
import { UserService } from '../user/user.service';
import { Order } from './entities/order.entity';
import { OrderStatus, OrderStatusLevel } from './order-status.enum';

@Injectable()
export class OrderService extends ModelService<Order> {
  private emailTemplate: HandlebarsTemplateDelegate;
  private logger: Logger = new Logger(`Cron - Order Service`);

  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [
    'uid',
    '$user.name$',
    'total',
    'repeating_days',
    '$dispenser.name$',
    'coupon_code',
  ];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['user', 'dispenser', 'coupon'];

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
    private _productService: ProductsService,
    private templateService: TemplateService,
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

      // if (data.user_id !== job.owner.id) {
      //   throw "You don't have permission to change the status.";
      // }

      if (
        data.status !== OrderStatus.PaymentPending &&
        data.status !== OrderStatus.Ordered
      ) {
        throw "You can't cancel this order";
      }
    }

    // if (job.action === 'cancelReorder') {
    //   const { error, data } = await this.$db.findRecordById({
    //     id: +job.id,
    //     options: {
    //       include: [{ association: 'user' }],
    //     },
    //   });

    //   if (!!error) {
    //     throw error;
    //   }
    //   // send email to admin for reorder cancellation
    //   const { data: setttingData } = await this._settingService.findOne({
    //     action: 'findOne',
    //     payload: { where: { name: 'order_service_email' } },
    //   });
    //   if (data.user_id !== job.owner.id) {
    //     //send email to customer
    //     await this._msClient.executeJob(
    //       'controller.notification',
    //       new Job({
    //         action: 'send',
    //         payload: {
    //           skipUserConfig: true,
    //           user_id: data.user_id,
    //           template: 'reorder_cancelled_by_admin',
    //           variables: {
    //             ORDER_ID: data.uid,
    //             CUSTOMER_NAME: data.user.name,
    //           },
    //         },
    //       }),
    //     );
    //   }
    //   // send to admin
    //   if (setttingData && setttingData?.getDataValue('value')) {
    //     await this._msClient.executeJob(
    //       'controller.notification',
    //       new Job({
    //         action: 'send',
    //         payload: {
    //           skipUserConfig: true,
    //           users: [
    //             {
    //               name: 'Admin',
    //               email: setttingData.getDataValue('value'),
    //               send_email: true,
    //             },
    //           ],
    //           template: 'reorder_cancelled',
    //           variables: {
    //             ORDER_ID: data.uid,
    //             CUSTOMER_NAME: data.user.name,
    //           },
    //         },
    //       }),
    //     );
    //   }

    //   // if (data.user_id !== job.owner.id) {
    //   //   throw "You don't have permission to change the status.";
    //   // }
    // }

    if (job.action === 'changeOrderStatus') {
      const { error, data } = await this.$db.findRecordById({
        id: +job.id,
      });

      if (!!error) {
        throw error;
      }
      if (job.body.status !== OrderStatus.Cancelled) {
        if (
          OrderStatusLevel[getEnumKeyByValue(OrderStatus, job.body.status)] <=
          OrderStatusLevel[getEnumKeyByValue(OrderStatus, data.status)]
        ) {
          throw "You can't downgrade the order status";
        }
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

      if (response.data.status === OrderStatus.Delivered) {
        // Send order placed socket notification
        await this._msClient.executeJob('controller.socket-event', {
          action: 'orderStatusChange',
          payload: {
            user_id: response.data.user_id,
            data: {
              order_id: response.data.uid,
              id: response.data.id,
            },
          },
        });

        // Send order delivered mail notification
        await this._msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_id: response.data.user_id,
              template: 'order_delivered',
              variables: {
                ORDER_ID: response.data.uid,
              },
            },
          }),
        );
      }

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
              id: response.data.id,
            },
          },
        });

        // Send order confirmation mail notification
        // await this._msClient.executeJob(
        //   'controller.notification',
        //   new Job({
        //     action: 'send',
        //     payload: {
        //       user_id: response.data.user_id,
        //       template: 'order_confirm_to_customer',
        //       variables: {
        //         ORDER_ID: response.data.uid,
        //       },
        //     },
        //   }),
        // );
        // await this._msClient.executeJob('order.confirm.email', {
        //   payload: {
        //     id: response.data.id,
        //   },
        // });
        await this._msClient.executeJob('order.mail.sent', {
          payload: {
            order_id: response.data.id,
            to: Role.Customer,
          },
        });
        //send email to admin if its not a repeating order
        if (response.data.is_repeating_order == 'N') {
          await this._msClient.executeJob('order.mail.sent', {
            payload: {
              order_id: response.data.id,
              to: Role.Admin,
            },
          });
        }

        // create order in xps
        await this.createShipments({
          payload: {
            id: response.data.id,
          },
        });
      }

      if (
        // response.previousData.status === OrderStatus.Ordered &&
        response.data.status === OrderStatus.Cancelled
      ) {
        const deletedShipment = await this._xpsService.deleteOrder({
          payload: { orderId: response.data.uid },
        });
        // if (!!deletedShipment.error) {
        //   throw deletedShipment.error;
        // }

        await this._msClient.executeJob('order.commission.cancel', {
          payload: {
            order_id: response.data.id,
          },
        });
        // send email to customer for order cancellation
        await this._msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_id: response.data.user_id,
              template: 'order_cancelled',
              variables: {
                ORDER_ID: response.data.uid,
                DATE: moment(response.data.created_at)
                  .tz('America/New_York')
                  .format('MM/DD/YYYY hh:mm A'),
              },
            },
          }),
        );
      }

      if (response.previousData.status !== response.data.status) {
        // Send order placed socket notification
        await this._msClient.executeJob('controller.socket-event', {
          action: 'orderStatusChange',
          payload: {
            user_id: response.data.user_id,
            data: {
              order_id: response.data.uid,
              id: response.data.id,
            },
          },
        });
      }
    }

    // if (job.action === 'cancelReorder') {
    //   // Send order placed socket notification
    //   await this._msClient.executeJob('controller.socket-event', {
    //     action: 'cancelReorder',
    //     payload: {
    //       user_id: response.data.user_id,
    //       data: {
    //         order_id: response.data.uid,
    //         id: response.data.id,
    //       },
    //     },
    //   });
    // }
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
          next_order_date:
            body.is_repeating_order === 'Y'
              ? moment().add(body.repeating_days, 'days')
              : null,
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

            order.data.setDataValue('dispenser_id', couponData.data?.user_id);

            // add log for user-dispenser update
            await this._msClient.executeJob('user.dispenser.change', {
              owner: { id: job.owner.id },
              payload: {
                user_id: job.owner.id,
                dispenser_id: couponData.data?.user_id,
                connection_via: ConnectionVia.Coupon,
              },
            });
          }
        }
        // create commission
        await this._msClient.executeJob('order.commission.create', {
          payload: {
            order_id: order.data.id,
          },
        });
      }

      // create stripe product, price and payment link only for non-repeating orders
      if (body.is_repeating_order === 'N') {
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
            restrictions: {
              completed_sessions: {
                limit: 1,
              },
            },
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

        await transaction.commit();
        return { data: { order: order.data, payment_link: paymentLink.url } };
      } else {
        await transaction.commit();
        await this._msClient.executeJob('order.mail.sent', {
          payload: {
            order_id: order.data.id,
            to: Role.Admin,
            card_details: body.card_details,
          },
        });
        return { data: { order: order.data, payment_link: '' } };
      }

      await order.data.save();
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
            next_order_date: literal(
              `DATE_FORMAT(Order.next_order_date,'%Y-%M-%d') = DATE_FORMAT(CURDATE( ),'%Y-%M-%d')`,
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
          sub_total < shippingLimitData.value && o.user?.role !== Role.Dispenser
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
            next_order_date: moment().add(o.repeating_days, 'days'),
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
          console.log(order.error);

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
            restrictions: {
              completed_sessions: {
                limit: 1,
              },
            },
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

        await this._msClient.executeJob('order.commission.create', {
          payload: {
            order_id: order.data.id,
          },
        });

        await this._msClient.executeJob('order.mail.sent', {
          payload: {
            order_id: order.data.id,
            to: Role.Admin,
            isReorder: true,
          },
        });

        // const { data } = await this._settingService.findOne({
        //   action: 'findOne',
        //   payload: { where: { name: 'order_service_email' } },
        // });
        // if (data && data?.getDataValue('value')) {
        //   // New order alert to admin
        //   await this._msClient.executeJob(
        //     'controller.notification',
        //     new Job({
        //       action: 'send',
        //       payload: {
        //         skipUserConfig: true,
        //         users: [
        //           {
        //             name: 'Admin',
        //             email: data.getDataValue('value'),
        //             send_email: true,
        //           },
        //         ],
        //         template: 'new_order_alert_to_admin',
        //         variables: {
        //           ORDER_ID: order.data.uid,
        //           CUSTOMER_NAME: o.user.name,
        //         },
        //       },
        //     }),
        //   );
        // }
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
              `DATE_FORMAT(DATE_ADD(Order.next_order_date, INTERVAL -2 DAY ),'%Y-%M-%d') = DATE_FORMAT(CURDATE( ),'%Y-%M-%d')`,
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
          // where: { user_id: job.owner.id },
          include: [
            { association: 'address' },
            { association: 'user' },
            { association: 'items', include: [{ association: 'product' }] },
          ],
        },
      });
      if (!!error) {
        return { error };
      }
      const nextRepeatingDay = moment(data.created_at).add(
        repeating_days,
        'days',
      );
      const currentRepeatingDays = data.repeating_days;
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

      data.setDataValue('next_order_date', nextRepeatingDay);
      data.setDataValue('repeating_days', repeating_days);
      await data.save();

      const { data: emailData } = await this._settingService.findOne({
        action: 'findOne',
        payload: { where: { name: 'order_service_email' } },
      });

      if (job.action == 'reorderCycleChange') {
        // send emai to customer for updates by admin
        if (job.owner.id !== data.user_id) {
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                user_id: data.user_id,
                template: 'reorder_cycle_change_by_admin',
                variables: {
                  ORDER_ID: data.uid,
                  ORIGINAL_DAYS: currentRepeatingDays,
                  NEW_DAYS: repeating_days,
                  CUSTOMER_NAME: data.user.name,
                  NEXT_ORDER_DATE:
                    moment(nextRepeatingDay).format('MM/DD/YYYY'),
                },
              },
            }),
          );
        }
        if (emailData && emailData?.getDataValue('value')) {
          // send email to admin for reorder cycle change
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                users: [
                  {
                    name: 'Admin',
                    email: emailData.getDataValue('value'),
                    send_email: true,
                  },
                ],
                template: 'reorder_cycle_change',
                variables: {
                  ORDER_ID: data.uid,
                  ORIGINAL_DAYS: currentRepeatingDays,
                  NEW_DAYS: repeating_days,
                  CUSTOMER_NAME: data.user.name,
                },
              },
            }),
          );
        }
      }
      if (job.action == 'reorder') {
        // send email to admin
        // sent email to admin for reccurring order with card details
        const card_details = {
          cardholder_name: job.payload.card_details.cardholder_name,
          card_number: job.payload.card_details.card_number.replace(
            /(\d{4})/g,
            '$1 ',
          ),
          expiration_date: job.payload.card_details.expiration_date,
          cvv: job.payload.card_details.cvv,
        };
        await this._msClient.executeJob('order.mail.sent', {
          payload: {
            order_id: data.id,
            to: Role.Admin,
            card_details: card_details,
          },
        });
      }
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
        'Dispenser Name',
        'Coupon Code',
        'Price ($)',
        'Tax ($)',
        'Discount Applied ($)',
        'Shipping Price ($)',
        'Total Price ($)',
        'Shipping Service',
        'Shipping Address 1',
        'Shipping Address 2',
        'Shipping City',
        'Shipping State',
        'Shipping Zip Code',
        'Billing Address 1',
        'Billing Address 2',
        'Billing City',
        'Billing State',
        'Billing Zip Code',
        'Repeated Days',
        'Order Date',
        'Delivery Status',
      ]);

      const orders: Order[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        orders.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.uid,
            x?.user?.name,
            x?.dispenser?.name,
            x?.coupon_code,
            `${x?.sub_total.toFixed(2)}`,
            `${x?.tax.toFixed(2)}`,
            `${x?.coupon_discount_amount ? x?.coupon_discount_amount.toFixed(2) : ' '}`,
            `${x?.shipping_price.toFixed(2)}`,
            `${x?.total.toFixed(2)}`,
            x?.shipping_service ? x?.shipping_service : 'Not Shipped',
            `${x?.address?.shipping_address}`,
            `${x?.address?.shipping_address2}`,
            `${x?.address?.shipping_city}`,
            `${x?.address?.shipping_state}`,
            `${x?.address?.shipping_zip_code}`,
            `${x?.address?.billing_address}`,
            `${x?.address?.billing_address2}`,
            `${x?.address?.billing_city}`,
            `${x?.address?.billing_state}`,
            `${x?.address?.billing_zip_code}`,
            x?.repeating_days,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY'),
            x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'uid', width: 25 },
        { header: 'Customer Name', key: 'name', width: 25 },
        { header: 'Dispenser Name', key: 'dispenser', width: 25 },
        { header: 'Coupon Code', key: 'coupon', width: 25 },
        { header: 'Price ($)', key: 'sub_total', width: 10 },
        { header: 'Tax ($)', key: 'tax', width: 10 },
        {
          header: 'Discount Applied ($)',
          key: 'coupon_discount_amount',
          width: 10,
        },
        { header: 'Shipping Price ($)', key: 'shipping_price', width: 10 },
        { header: 'Total Price ($)', key: 'total', width: 10 },
        { header: 'Shipping Service', key: 'shipping_service', width: 25 },
        { header: 'Shipping Address 1', key: 'shipping_address', width: 50 },
        { header: 'Shipping Address 2', key: 'shipping_address', width: 50 },
        { header: 'Shipping City', key: 'shipping_address', width: 50 },
        { header: 'Shipping State', key: 'shipping_address', width: 50 },
        { header: 'Shipping Zip Code', key: 'shipping_address', width: 50 },
        { header: 'Billing Address 1', key: 'billing_address', width: 50 },
        { header: 'Billing Address 2', key: 'billing_address', width: 50 },
        { header: 'Billing City', key: 'billing_address', width: 50 },
        { header: 'Billing State', key: 'billing_address', width: 50 },
        { header: 'Billing Zip Code', key: 'billing_address', width: 50 },
        { header: 'Repeated Days', key: 'repeating_days', width: 10 },
        { header: 'Order Date', key: 'created_at', width: 50 },
        { header: 'Delivery Status', key: 'active', width: 25 },
      ];

      const folder = 'order-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-OrderManagement.xlsx`;
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
        'User Name',
        'Dispenser Name',
        'Total Price ($)',
        'Repeat Interval (in days)',
        'Shipping Address 1',
        'Shipping Address 2',
        'Shipping City',
        'Shipping State',
        'Shipping Zip Code',
        'Billing Address 1',
        'Billing Address 2',
        'Billing City',
        'Billing State',
        'Billing Zip Code',
        'Created On',
        'Next Order Date',
        'Previous Order Date',
        // 'Status',
      ]);

      const orders: Order[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        orders?.map(async (x, index) => {
          console.log(x);

          worksheet.addRow([
            index + 1,
            x?.uid,
            x?.user?.name,
            x?.dispenser?.name,
            `${x?.total.toFixed(2)}`,
            x?.repeating_days,
            `${x?.address?.shipping_address}`,
            `${x?.address?.shipping_address2}`,
            `${x?.address?.shipping_city}`,
            `${x?.address?.shipping_state}`,
            `${x?.address?.shipping_zip_code}`,
            `${x?.address?.billing_address}`,
            `${x?.address?.billing_address2}`,
            `${x?.address?.billing_city}`,
            `${x?.address?.billing_state}`,
            `${x?.address?.billing_zip_code}`,
            x?.created_at
              ? moment(x?.created_at)?.tz(timezone)?.format('MM/DD/YYYY')
              : '',
            x?.created_at
              ? moment(x?.created_at)
                  ?.add(x?.repeating_days, 'days')
                  ?.tz(timezone)
                  ?.format('MM/DD/YYYY')
              : '',
            x?.previous_order && x?.previous_order?.created_at
              ? moment(x?.previous_order?.created_at)
                  ?.tz(timezone)
                  ?.format('MM/DD/YYYY')
              : '',
            // x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Order ID', key: 'uid', width: 25 },
        { header: 'User Name', key: 'name', width: 25 },
        { header: 'Dispenser Name', key: 'name', width: 25 },
        { header: 'Total Price ($)', key: 'total', width: 10 },
        {
          header: 'Repeat Interval (in days)',
          key: 'repeating_days',
          width: 10,
        },
        { header: 'Shipping Address 1', key: 'shipping_address', width: 50 },
        { header: 'Shipping Address 2', key: 'shipping_address', width: 50 },
        { header: 'Shipping City', key: 'shipping_address', width: 50 },
        { header: 'Shipping State', key: 'shipping_address', width: 50 },
        { header: 'Shipping Zip Code', key: 'shipping_address', width: 50 },
        { header: 'Billing Address 1', key: 'billing_address', width: 50 },
        { header: 'Billing Address 2', key: 'billing_address', width: 50 },
        { header: 'Billing City', key: 'billing_address', width: 50 },
        { header: 'Billing State', key: 'billing_address', width: 50 },
        { header: 'Billing Zip Code', key: 'billing_address', width: 50 },
        { header: 'Created On', key: 'created_at', width: 50 },
        { header: 'Next Order Date', key: 'created_at', width: 50 },
        { header: 'Previous Order Date', key: 'previous_order', width: 50 },
      ];

      const folder = 'order-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-ReorderManagement.xlsx`;
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

  async createShipments(job: Job): Promise<JobResponse> {
    const order = await this.$db.findRecordById({
      id: job.payload.id,
      options: {
        include: [
          {
            association: 'items',
            include: [
              {
                association: 'product',
                include: [
                  { association: 'product_primary_image' },
                  { association: 'productCategory' },
                ],
              },
            ],
          },
          { association: 'user' },
          { association: 'dispenser' },
          { association: 'address' },
        ],
      },
    });

    const { items, user, dispenser, address } = order.data;
    const { order_weight, height, length, width } = order.data.items.reduce(
      (acc, item) => {
        acc.order_weight += item.product.weight_lbs * item.quantity;
        acc.height += item.product.height * item.quantity;
        acc.length += item.product.length * item.quantity;
        acc.width += item.product.width * item.quantity;
        return acc;
      },
      { order_weight: 0, height: 0, length: 0, width: 0 },
    );
    //ship product
    const shipment = await this._xpsService.createShipment({
      payload: {
        orderId: order.data.uid,
        orderDate: moment(order.data.updated_at).format('YYYY-MM-DD'),
        orderNumber: null,
        fulfillmentStatus: 'pending',
        shippingService:
          order_weight < 1 ? 'usps_poly_bag' : 'usps_custom_package',
        shippingTotal: null,
        weightUnit: 'lb',
        dimUnit: 'in',
        shipperReference: 'OPUS',
        shipperReference2: order.data.uid.split('-')[1],
        dueByDate: null,
        orderGroup: 'OPUS',
        contentDescription: `Order from ${user.name}`,
        receiver: {
          name: `${address.shipping_first_name} ${address.shipping_last_name}`,
          address1: address.shipping_address,
          company: user.business_name ? user.business_name : '',
          address2: address.shipping_address2 ? address.shipping_address2 : '',
          city: address.shipping_city,
          state: address.shipping_state,
          zip: address.shipping_zip_code,
          country: 'US',
          phone: user.phone,
          email: user.email,
        },
        items: items.map((item) => ({
          productId: item.product.id.toString(),
          sku: item?.product?.productCategory?.category_name,
          title: item.product?.product_name,
          price: item?.price.toString(),
          quantity: item?.quantity,
          weight: item.product?.weight_lbs.toString(),
          imgUrl: item.product?.product_primary_image?.product_image,
          htsNumber: null,
          countryOfOrigin: 'US',
          lineId: null,
        })),
        packages: [
          {
            weight: order_weight.toString(),
            height: +order_weight < 1 ? '0' : '4',
            width: +order_weight <= 1 ? '11' : '6',
            length: +order_weight <= 1 ? '8' : '8',
            insuranceAmount: null,
            declaredValue: null,
          },
        ],
      },
    });
    this.logger.log(shipment);
    if (!!shipment.error) {
      return { error: shipment.error };
    }
    return { data: 'shipment created successfully' };
  }

  async retrieveOrderNumber(payload: any): Promise<JobResponse> {
    try {
      const apiKey = this._config.get('xps').api_key;
      const customer_id = this._config.get('xps').customer_id;
      const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/searchShipments`;
      const body = {
        keyword: payload.keyword,
      };
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `RSIS ${apiKey}`,
        },
      });
      if (response.data && response.data.shipments.length === 0) {
        return { error: 'No shipment found' };
      }
      const order_data = await this.$db.findAndUpdateRecord({
        body: {
          book_number: response.data.shipments[0].bookNumber,
          tracking_number: response.data.shipments[0].trackingNumber,
          shipping_service: response.data.shipments[0].serviceCode,
          status: OrderStatus.Shipped,
        },
        options: {
          where: {
            uid: payload.uid,
          },
        },
      });
      if (!!order_data.error) {
        return { error: order_data.error };
      }

      // Create order-status-change-log
      await this._msClient.executeJob('order-status-log.create', {
        payload: {
          order_id: order_data.data.id,
          status: order_data.data.status,
        },
      });

      // Send order shipped socket notification
      await this._msClient.executeJob('controller.socket-event', {
        action: 'orderStatusChange',
        payload: {
          user_id: order_data.data.user_id,
          data: {
            order_id: order_data.data.uid,
            id: order_data.data.id,
          },
        },
      });

      // Send order shipment e-mail notification
      const { name, address1, city, state, zip } =
        response.data.shipments[0].receiver;
      await this._msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: order_data.data.user_id,
            template: 'order_shipped',
            variables: {
              ORDER_ID: order_data.data.uid,
              TRACKING_NUMBER: order_data.data.tracking_number,
              TRACKING_LINK: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${order_data.data.tracking_number}`,
              SHIPPING_NAME: name,
              SHIPPING_ADDRESS: address1,
              SHIPPING_CITY_STATE_ZIP: `${city}, ${state} ${zip}`,
            },
          },
        }),
      );

      return order_data;
    } catch (error) {
      return { error };
    }
  }

  async trackShipmentCron(): Promise<JobResponse> {
    const { error, data } = await this.$db.getAllRecords({
      action: 'findAll',
      options: {
        where: {
          status: OrderStatus.Shipped,
          book_number: { [Op.not]: null },
        },
      },
    });

    if (!!error) {
      return { error };
    }
    if (data.length === 0) {
      return { error: 'No order found' };
    }
    for await (const order of data) {
      try {
        const apiKey = this._config.get('xps').api_key;
        const customer_id = this._config.get('xps').customer_id;
        const url = `https://xpsshipper.com/restapi/v1/customers/${customer_id}/shipments/${order.book_number}/tracking-information`;
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `RSIS ${apiKey}`,
          },
        });

        //manage voided shipments here
        if (
          response.data ==
          'Shipment is voided. Voided shipments are not tracked'
        ) {
          await this._msClient.executeJob('order.status.update', {
            payload: {
              order_id: order.id,
              status: OrderStatus.ShippingFailed,
            },
          });
          //recreate shipment
          // update uid of the order
          let parts = order.uid.split('-');
          if (parts[2] === 'RE') {
            let currentNumber = parseInt(parts[3]);
            parts[3] = (currentNumber + 1).toString();
          } else {
            parts.splice(2, 0, 'RE', '1');
          }
          const newUID = parts.join('-');
          const newOrder = await this.$db.findAndUpdateRecord({
            body: {
              uid: newUID,
            },
            options: {
              where: {
                id: order.id,
              },
            },
          });

          const shipment = await this.createShipments({
            payload: {
              id: newOrder.data.id,
            },
          });
          if (!!shipment.error) {
            return { error: shipment.error };
          } else {
            await this._msClient.executeJob('order.status.update', {
              payload: {
                order_id: order.id,
                status: OrderStatus.Ordered,
              },
            });
          }
        }

        if (response.data && response.data.length === 0) {
          return { error: 'No shipment found' };
        }

        // manage shipment status here
        for await (const status of response.data) {
          // if (status.eventStatus == 'Delivered') {
          //   await this._msClient.executeJob('order.status.update', {
          //     payload: {
          //       order_id: order.id,
          //       status: OrderStatus.Delivered,
          //     },
          //   });
          // }
          switch (status) {
            case 'Delivered':
              await this._msClient.executeJob('order.status.update', {
                payload: {
                  order_id: order.id,
                  status: OrderStatus.Delivered,
                },
              });
              break;
            case 'Failed Attempt':
              await this._msClient.executeJob('order.status.update', {
                payload: {
                  order_id: order.id,
                  status: OrderStatus.ShippingFailed,
                },
              });
              break;
            default:
            // code block
          }
        }

        return { data: order };
      } catch (error) {
        return { error };
      }
    }
  }

  async paymentReminderCron(): Promise<JobResponse> {
    const reminder_timer = await this._settingService.$db.findOneRecord({
      action: 'findOne',
      options: { where: { name: 'timer_for_initial_reminder' } },
    });
    const { error, data } = await this.$db.getAllRecords({
      action: 'findAll',
      options: {
        where: {
          status: OrderStatus.PaymentPending,
          is_repeating_order: 'N',
          created_at: literal(
            `DATE_FORMAT(Order.created_at, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${parseInt(reminder_timer.data.value)} HOUR), '%Y-%m-%d %H:%i:00')`,
          ),
        },
        include: [{ association: 'current_payment' }],
      },
    });

    if (!!error) {
      return { error };
    }
    if (data.length === 0) {
      return { error: 'No order found' };
    }
    for await (const order of data) {
      const { error } = await this._msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: order.user_id,
            template: 'payment_pending_reminder',
            variables: {
              ORDER_ID: order.uid,
              DATE: moment(order.created_at)
                .tz('America/New_York')
                .format('MM/DD/YYYY hh:mm A'),
              PAYMENT_LINK: order.current_payment.payment_link_url,
            },
          },
        }),
      );
      if (!!error) {
        return { error };
      }
    }
  }

  async paymentReminderFinalCron(): Promise<JobResponse> {
    const reminder_timer = await this._settingService.$db.findOneRecord({
      action: 'findOne',
      options: { where: { name: 'timer_for_final_reminder' } },
    });
    if (!!reminder_timer.error) {
      return { error: reminder_timer.error };
    }

    const { error, data } = await this.$db.getAllRecords({
      action: 'findAll',
      options: {
        where: {
          status: OrderStatus.PaymentPending,
          is_repeating_order: 'N',
          created_at: literal(
            `DATE_FORMAT(Order.created_at, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${parseInt(reminder_timer.data.value)} HOUR), '%Y-%m-%d %H:%i:00')`,
          ),
        },
        include: [{ association: 'current_payment' }],
      },
    });

    if (!!error) {
      return { error };
    }
    if (data.length === 0) {
      return { error: 'No order found' };
    }
    for await (const order of data) {
      await this._msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: order.user_id,
            template: 'final_payment_pending_reminder',
            variables: {
              ORDER_ID: order.uid,
              PAYMENT_LINK: order.current_payment.payment_link_url,
            },
          },
        }),
      );
    }
  }

  async orderCancelCron(): Promise<JobResponse> {
    const cancellation_timer = await this._settingService.$db.findOneRecord({
      action: 'findOne',
      options: { where: { name: 'hours_for_cancellation' } },
    });

    if (!!cancellation_timer.error) {
      return { error: cancellation_timer.error };
    }
    const { error, data } = await this.$db.getAllRecords({
      action: 'findAll',
      options: {
        where: {
          status: OrderStatus.PaymentPending,
          is_repeating_order: 'N',
          created_at: literal(
            `DATE_FORMAT(Order.created_at, '%Y-%m-%d %H:%i:00') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${parseInt(cancellation_timer.data.value)} HOUR), '%Y-%m-%d %H:%i:00')`,
          ),
        },
        include: [{ association: 'current_payment' }],
      },
    });

    if (!!error) {
      return { error };
    }
    if (data.length === 0) {
      return { error: 'No order found' };
    }
    for await (const order of data) {
      await this._msClient.executeJob('order.status.update', {
        payload: {
          order_id: order.id,
          status: OrderStatus.Cancelled,
        },
      });
    }
  }
  async getProductImageUrl(id: number) {
    try {
      const { error, data } = await this._productService.$db.findRecordById({
        id: +id,
        options: {
          include: [
            {
              association: 'productCategory',
            },
            { association: 'product_primary_image' },
          ],
        },
      });
      if (!!error) {
        return { error };
      }
      const image = data.product_primary_image.product_image;
      return image;
    } catch (error) {
      return { error };
    }
  }
  async getProductName(id: number) {
    try {
      const { error, data } = await this._productService.$db.findRecordById({
        id: +id,
      });
      if (!!error) {
        return { error };
      }

      return data.product_name;
    } catch (error) {
      return { error };
    }
  }
  async sendOrderConfirmEmail(id: number) {
    const { error, data } = await this.$db.findRecordById({
      id: id,
      options: {
        include: [
          { association: 'address' },
          { association: 'user' },
          { association: 'items', include: [{ association: 'product' }] },
        ],
      },
    });
    if (!!error) {
      return { error };
    }

    try {
      const template = fs.readFileSync(
        join(__dirname, '../src', 'views/order_template.hbs'),
        'utf8',
      );
      // handlebars.registerHelper('checkLength', function (array) {
      //   if (array.length > 1) {
      //     return 'These products were recommended by your personal Opus Dispenser';
      //   } else {
      //     return 'This product was recommended by your personal Opus Dispenser';
      //   }
      // });
      this.emailTemplate = handlebars.compile(template);
    } catch (error) {
      this.emailTemplate = handlebars.compile('<div>{{{content}}}</div>');
    }

    const shipping_address = `${data.address.shipping_first_name + ' ' + data.address.shipping_last_name}, ${data.address.shipping_address}, ${data.address.shipping_city}, ${data.address.shipping_state}, ${data.address.shipping_zip_code}`;
    const billing_address = `${data.address.billing_first_name + ' ' + data.address.billing_last_name}, ${data.address.billing_address}, ${data.address.billing_city}, ${data.address.billing_state}, ${data.address.billing_zip_code}`;
    const products = await Promise.all(
      data.items.map(async (item) => ({
        name: await this.getProductName(item.product_id),
        price: item.price_per_item,
        quantity: item.quantity,
        order_id: data.uid,
        image: await this.getProductImageUrl(item.product_id),
      })),
    );
    const _email_template = this.emailTemplate({
      logo: this._config.get('cdnLocalURL') + 'assets/logo.png',
      header_bg_image: this._config.get('cdnLocalURL') + 'assets/header-bg.png',
      footer_bg_image: this._config.get('cdnLocalURL') + 'assets/footer-bg.png',
      reorder: false,
      title_content: `
Hello ${data.user.name}, thank you for your order!, Your order placed on ${moment(
        data.created_at,
      )
        .tz('America/New_York')
        .format('MM/DD/YYYY')} is confirmed. You can find the details below.`,
      ORDER_ID: data.uid,
      CUSTOMER_NAME: data.user.name,
      PHONE_NUMBER: data.user.phone,
      EMAIL: data.user.email,
      ORDER_DATE: moment(data.created_at)
        .tz('America/New_York')
        .format('MM/DD/YYYY'),
      TAX: Math.round(data.tax * 100) / 100,
      SHIPPING_CHARGE: data.shipping_price,
      DISCOUNT: data.coupon_discount_amount ? data.coupon_discount_amount : 0,
      TOTAL: data.total,
      SHIPPING_ADDRESS: shipping_address,
      BILLING_ADDRESS: billing_address,
      products: products,
    });

    const email_subject = `Your Order ${data.uid} is Confirmed!`;

    await this._msClient.executeJob(
      'controller.email',
      new Job({
        action: 'sendMail',
        payload: {
          to: data.user.email,
          subject: email_subject,
          html: _email_template,
          from: this._config.get('email').transports['Orders'].from || '',
          transporterName: 'Orders',
        },
      }),
    );
  }

  async orderMail({
    order_id,
    to,
    card_details,
    isReorder = false,
  }: {
    order_id: number;
    to: Role;
    isReorder: boolean;
    card_details?: {
      cardholder_name: string;
      card_number: string;
      expiration_date: string;
      cvv: string;
    };
  }) {
    const { error, data } = await this.$db.findRecordById({
      id: order_id,
      options: {
        include: [
          { association: 'address' },
          { association: 'user' },
          {
            association: 'items',
            include: [
              {
                association: 'product',
                include: [{ association: 'product_primary_image' }],
              },
            ],
          },
        ],
      },
    });
    if (!!error) {
      return { error };
    }

    const templateName =
      to === Role.Admin
        ? !!isReorder
          ? 'new_reorder_alert_to_admin'
          : data.is_repeating_order === 'Y'
            ? 'new_repeat_order_alert_to_admin'
            : 'new_order_alert_to_admin'
        : 'new_order_alert_to_customer';

    const getTemplate = await this.templateService.$db.findOneRecord({
      options: {
        where: {
          name: templateName,
        },
      },
    });

    if (!!getTemplate.error) {
      return { error: getTemplate.error };
    }

    const template = getTemplate.data;
    const transporter = template.getDataValue('transporter') || '';
    let email_subject = template.getDataValue('email_subject') || '',
      email_body = template.getDataValue('email_body') || '';

    const SHIPPING_ADDRESS = `${data.address.shipping_first_name + ' ' + data.address.shipping_last_name}, ${data.address.shipping_address} ${data?.address?.shipping_address2 ? `, ${data?.address?.shipping_address2}` : ''}, ${data.address.shipping_city}, ${data.address.shipping_state}, ${data.address.shipping_zip_code}`;
    const BILLING_ADDRESS = `${data.address.billing_first_name + ' ' + data.address.billing_last_name}, ${data.address.billing_address} ${data?.address?.billing_address2 ? `, ${data?.address?.billing_address2}` : ''}, ${data.address.billing_city}, ${data.address.billing_state}, ${data.address.billing_zip_code}`;

    // let products_table = `<figure class="table">
    // <table class="gmail-table" style="margin-bottom:30px; width:100%">
    //     <thead>
    //         <tr>
    //             <th colspan="2">
    //                 Products
    //             </th>
    //         </tr>
    //     </thead>
    //     <tbody>`;
    //      data.items.forEach((item) => {
    //        products_table += `<tr style="display: block;">
    //         <td>
    //             <img style="width: 100px; height: 100px;" src="${item.product.product_primary_image.product_image}" alt="">
    //         </td>
    //         <td
    //             style="font-size: 18px;list-style: 35px; line-height: 24px; padding: 20px 0px;">
    //             ${item.product.product_name}</br>
    //             <b>$${item.price_per_item}</b> </br>
    //             Item: <b>${item.quantity}</b></br>
    //             Order ID: <b>${data.uid}</b>
    //         </td>
    //     </tr>`;
    //      });

    //      products_table += `</tbody>
    //     </table>
    // </figure>`;

    // let products_table = `<table
    //   align="center"
    //   width="100%"
    //   border="0"
    //   cellpadding="0"
    //   cellspacing="0"
    //   role="presentation"
    //   style="
    //     max-width: 37.5em;
    //     margin-left: auto;
    //     margin-right: auto;
    //     box-sizing: border-box;
    //     padding-top: 1rem;
    //     padding-bottom: 1rem;
    //     height: 100vh;
    //   "
    // >
    //   <tbody>
    //     <tr style="width: 100%">
    //       <td>
    //         <table
    //           align="center"
    //           width="100%"
    //           border="0"
    //           cellpadding="0"
    //           cellspacing="0"
    //           role="presentation"
    //           style="margin-top: 16px; margin-bottom: 16px"
    //         >
    //           <tbody border="1px ">
    //             <tr>
    //               <td>

    //               `;
    // data.items.forEach((item) => {
    //   products_table += `<table style="width: 100%; border: solid 1px black">
    //                   <tbody style="width: 100%">
    //                     <tr style="width: 100%">
    //                       <td
    //                         style="
    //                           width: 50%;
    //                           padding-right: 32px;
    //                           box-sizing: border-box;
    //                         "
    //                       >
    //                         <img
    //                           alt="Braun Vintage"
    //                           height="220"
    //                           src="${item.product.product_primary_image.product_image}"
    //                           style="
    //                             display: block;
    //                             outline: none;
    //                             border: none;
    //                             text-decoration: none;
    //                             border-radius: 8px;
    //                             width: 70%;
    //                             height: 70%
    //                             object-fit: cover;
    //                           "
    //                         />
    //                       </td>
    //                       <td style="width: 50%; vertical-align: baseline">
    //                         <p
    //                           style="
    //                             font-size: 20px;
    //                             line-height: 28px;
    //                             margin: 0px;
    //                             margin-top: 30px;
    //                             font-weight: 600;
    //                             color: rgb(17, 24, 39);
    //                           "
    //                         >
    //                           ${item.product.product_name}
    //                         </p>
    //                         <p
    //                           style="
    //                             font-size: 16px;
    //                             line-height: 24px;
    //                             margin: 16px 0;
    //                             margin-top: 8px;
    //                             color: rgb(107, 114, 128);
    //                           "
    //                         >
    //                           Quantity: ${item.quantity}
    //                         </p>
    //                         <p
    //                           style="
    //                             font-size: 18px;
    //                             line-height: 28px;
    //                             margin: 16px 0;
    //                             margin-top: 8px;
    //                             font-weight: 600;
    //                             color: rgb(17, 24, 39);
    //                           "
    //                         >
    //                           $${item.price_per_item}
    //                         </p>
    //                       </td>
    //                     </tr>
    //                   </tbody>
    //                 </table>`;
    // });

    // products_table += `</td>
    //             </tr>
    //           </tbody>
    //         </table>
    //       </td>
    //     </tr>
    //   </tbody>
    // </table>`;

    let products_table = ``;
    data.items.forEach((item) => {
      products_table += `<tr>
                                <td>
                                  <img
                                    style="width: 100px; height: 100px"
                                    width="100"
                                    height="100"
                                    src="${item.product.product_primary_image.product_image}"
                                    alt="Product Image"
                                  />
                                </td>
                                <td
                                  style="
                                    font-size: 18px;
                                    list-style: 35px;
                                    line-height: 24px;
                                    padding: 20px 0px;
                                  "
                                >
                                  ${item.product.product_name} <br />
                                  <b>$${item.price_per_item.toFixed(2)}</b> <br />
                                  Quantity: <b>${item.quantity}</b>
                                </td>
                                <td style="text-align: end"><b>$${(item.price_per_item * item.quantity).toFixed(2)}</b></td>
                              </tr>`;
    });
    const variables = {
      LOGO: this._config.get('cdnLocalURL') + 'assets/logo.png',
      HEADER_BG_IMAGE: this._config.get('cdnLocalURL') + 'assets/header-bg.png',
      FOOTER_BG_IMAGE: this._config.get('cdnLocalURL') + 'assets/footer-bg.png',
      CUSTOMER_NAME: data.user.name,
      ORDER_DATE: moment(data.created_at)
        .tz('America/New_York')
        .format('MM/DD/YYYY'),
      ORDER_ID: data.uid,
      PHONE_NUMBER: `${data.user.phone_code}${data.user.phone}`
        .replace(/\D/g, '')
        .replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4'),
      EMAIL: data.user.email,
      RECURRING_DAYS: data.repeating_days,
      // TAX: Math.round(data.tax * 100) / 100,
      TAX: data.tax.toFixed(2),
      SHIPPING_CHARGE: data.shipping_price.toFixed(2),
      DISCOUNT_KEY: data.coupon_discount_amount
        ? `Discount (${data.coupon_code})`
        : `Discount`,
      DISCOUNT: data.coupon_discount_amount
        ? data.coupon_discount_amount.toFixed(2)
        : '0.00',
      SHIPPING_SERVICE: 'USPS Ground Advantage',
      SUB_TOTAL: data.sub_total.toFixed(2),
      TOTAL: data.total.toFixed(2),
      SHIPPING_ADDRESS,
      BILLING_ADDRESS,
      CARDHOLDER_NAME: card_details?.cardholder_name || '',
      CARD_NUMBER: (card_details?.card_number || '').replace(/(\d{4})/g, '$1 '),
      EXPIRATION_DATE: card_details?.expiration_date || '',
      CVV: card_details?.cvv || '',
      PRODUCTS: products_table,
    };

    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        email_subject = email_subject.split(`##${key}##`).join(variables[key]);
        email_body = email_body.split(`##${key}##`).join(variables[key]);
      }
    }

    this.emailTemplate = handlebars.compile(email_body);

    let toEmail = ``;
    if (to === Role.Admin) {
      const { data: emailData } = await this._settingService.findOne({
        action: 'findOne',
        payload: { where: { name: 'order_service_email' } },
      });
      toEmail = emailData.getDataValue('value');
    } else {
      toEmail = data.user.email;
    }

    if (template.getDataValue('active')) {
      await this._msClient.executeJob(
        'controller.email',
        new Job({
          action: 'sendMail',
          payload: {
            to: toEmail,
            subject: email_subject,
            html: this.emailTemplate({}),
            from: this._config.get('email').transports[transporter].from || '',
            transporterName: transporter,
          },
        }),
      );
    }
  }

  async quoteShippingPrice(job: Job): Promise<JobResponse> {
    const { payload } = job;
    const senderAddress = await this._settingService.$db.findOneRecord({
      options: {
        attributes: ['value'],
        where: {
          group_id: 2,
          name: 'xps_sender_address_zip',
        },
      },
    });
    const pieces = [];
    for (let i = 0; i < payload.items.length; i++) {
      for (let j = 0; j < payload.items[i].quantity; j++) {
        pieces.push({
          weight: payload.items[i].weight.toString(),
          length: payload.items[i].length.toString(),
          width: payload.items[i].width.toString(),
          height: payload.items[i].height.toString(),
          insuranceAmount: null,
          declaredValue: null,
        });
      }
    }
    const price = await this._xpsService.quoteShippingPrice({
      payload: {
        carrierCode: 'usps',
        serviceCode: '',
        packageTypeCode: '',
        sender: {
          country: 'US',
          zip: senderAddress.data.value,
        },
        receiver: {
          city: payload.shipping_city,
          country: 'US',
          zip: payload.shipping_zip_code,
          // "email":"foo@bar.com"
        },
        residential: true,
        signatureOptionCode: 'DIRECT',
        contentDescription: 'stuff and things',
        weightUnit: 'oz',
        dimUnit: 'in',
        currency: 'USD',
        customsCurrency: 'USD',
        pieces: pieces,
        billing: {
          party: 'sender',
        },
        //   "providerAccountId": null
      },
    });
    if (price.data.quotes && price.data.quotes.length > 0) {
      const data = price.data.quotes.map((e) => ({
        carrierCode: e.carrierCode,
        serviceCode: e.serviceCode,
        packageTypeCode: e.packageTypeCode,
        totalAmount: e.totalAmount,
      }));

      return { data };
    } else {
      return { error: 'error quoting' };
    }
  }

  async cancelReorder(job: Job): Promise<JobResponse> {
    try {
      const {
        payload: { order_id, next_order_only },
        owner,
        action,
      } = job;

      const { error, data } = await this.findById({
        owner,
        action,
        id: +order_id,
        payload: {
          populate: ['address', 'user', 'items'],
        },
      });

      if (!!error) {
        return { error };
      }

      if (!!next_order_only) {
        const previousRepeatingDate = data.getDataValue('next_order_date');
        const repeatingDays = data.getDataValue('repeating_days');
        const next_order_date = moment(previousRepeatingDate).add(
          repeatingDays,
          'days',
        );
        console.log(previousRepeatingDate, 'previousRepeatingDate');
        console.log(next_order_date, 'next_order_date');

        data.setDataValue('next_order_date', next_order_date);
        if (data.user_id !== job.owner.id) {
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                user_id: data.user_id,
                template: 'single_reorder_cancelled_by_admin',
                variables: {
                  DATE: moment(previousRepeatingDate)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY'),
                  ORDERID: data.uid,
                  NEXT_ORDER_DATE: moment(next_order_date)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY'),
                },
              },
            }),
          );
        }
        await data.save();
      } else {
        data.setDataValue('is_repeating_order', 'N');
        await data.save();
        if (data.user_id !== job.owner.id) {
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                user_id: data.user_id,
                template: 'reorder_cancelled_by_admin',
                variables: {
                  ORDERID: data.uid,
                },
              },
            }),
          );
        } else {
          // send email to admin for reorder cancellation by user
          const { data: setttingData } = await this._settingService.findOne({
            action: 'findOne',
            payload: { where: { name: 'order_service_email' } },
          });

          if (setttingData && setttingData?.getDataValue('value')) {
            await this._msClient.executeJob(
              'controller.notification',
              new Job({
                action: 'send',
                payload: {
                  skipUserConfig: true,
                  users: [
                    {
                      name: 'Admin',
                      email: setttingData.getDataValue('value'),
                      send_email: true,
                    },
                  ],
                  template: 'reorder_cancelled',
                  variables: {
                    ORDER_ID: data.uid,
                    CUSTOMER_NAME: data.user.name,
                  },
                },
              }),
            );
          }
        }
      }

      //TODO send email to user for reorder cancellation by admin
      if (data.user_id !== job.owner.id) {
        if (next_order_only) {
        } else {
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                user_id: data.user_id,
                template: 'reorder_cancelled_by_admin',
                variables: {
                  ORDERID: data.uid,
                },
              },
            }),
          );
        }
      } else {
        // send email to admin for reorder cancellation by user
        const { data: setttingData } = await this._settingService.findOne({
          action: 'findOne',
          payload: { where: { name: 'order_service_email' } },
        });

        if (setttingData && setttingData?.getDataValue('value')) {
          await this._msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                skipUserConfig: true,
                users: [
                  {
                    name: 'Admin',
                    email: setttingData.getDataValue('value'),
                    send_email: true,
                  },
                ],
                template: 'reorder_cancelled',
                variables: {
                  ORDER_ID: data.uid,
                  CUSTOMER_NAME: data.user.name,
                },
              },
            }),
          );
        }
      }

      // Send reorder cancelled socket notification
      await this._msClient.executeJob('controller.socket-event', {
        action: 'cancelReorder',
        payload: {
          user_id: data.user_id,
          data: {
            order_id: data.uid,
            id: data.id,
          },
        },
      });

      return { data };
    } catch (error) {
      return { error };
    }
  }
}
