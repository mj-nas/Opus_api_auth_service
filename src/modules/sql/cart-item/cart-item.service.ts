import { ModelService, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemService extends ModelService<CartItem> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<CartItem>) {
    super(db);
  }

  /**
   * doBeforeCreate
   * @function function will execute before create function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCreate(job: SqlJob<CartItem>): Promise<void> {
    await super.doBeforeCreate(job);
    const { cart_id, product_id } = job.body;
    const item = await this.$db.findOneRecord({
      options: {
        where: {
          cart_id: cart_id,
          product_id: product_id,
        },
      },
    });
    if (item.data) {
      const newCart = await this.$db.updateRecord({
        id: item.data.id,
        body: {
          quantity: item.data.quantity + 1,
        },
      });
      if (!newCart.error) {
        throw 'Cart updated Successfully';
      }
    }
  }
}
