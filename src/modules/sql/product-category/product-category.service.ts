import {
  ModelService,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService extends ModelService<ProductCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['category_name'];

  constructor(
    db: SqlService<ProductCategory>,
    private productsService: ProductsService,
  ) {
    super(db);
  }

  /**
   * doBeforeRead
   * @function function will execute before findAll, getCount, findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeRead(job: SqlJob<ProductCategory>): Promise<void> {
    await super.doBeforeRead(job);
    if (job.action === 'publicFindAll')
      job.options.attributes = [
        'id',
        'category_name',
        'category_image',
        'sort',
      ];
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeDelete(job: SqlJob<ProductCategory>): Promise<void> {
    await super.doBeforeDelete(job);
    try {
      /**check if any category is assigned to any product */
      const products = (
        await this.productsService.findAll({
          options: { where: { product_category: job.body.id } },
        })
      )?.data;
      if (products?.length)
        throw new Error(
          'Cannot delete category because it is assigned to one or more products.',
        );
    } catch (error) {
      throw error;
    }
  }

  /**
   * update bulk
   * @function update array of record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulk(
    job: SqlJob<ProductCategory>,
  ): Promise<SqlCreateBulkResponse<ProductCategory>> {
    if (!Array.isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: ProductCategory[] = [];
    for (let index = 0; index < job.records.length; index++) {
      const record = job.records[index];
      const response = await this.update({
        owner: job.owner,
        action: 'update',
        id: record.id,
        body: record,
        options: {
          fields: ['sort'],
        },
      });
      productSort.push(response.data);
    }
    return { data: productSort };
  }

  async getHomeCategoryList() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 4,
          order: [['sort', 'asc']],
          where: { status: 'Y' },
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async getFooterCategoryList() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 5,
          order: [['sort', 'asc']],
          where: { status: 'Y' },
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
