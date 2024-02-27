import {
  ModelService,
  ModelWrap,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductCategory } from './entities/product-category.entity';
import { isArray } from 'class-validator';
@Injectable()
export class ProductCategoryService extends ModelService<ProductCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['category_name'];

  constructor(db: SqlService<ProductCategory>) {
    super(db);
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
    if (!isArray(job.records) || !job.records.length) {
      return { error: 'Records missing' };
    }
    const productSort: ModelWrap<ProductCategory>[] = [];
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
}
