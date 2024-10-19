import {
  ModelService,
  SqlCreateBulkResponse,
  SqlJob,
  SqlService,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { ProductsService } from '../products/products.service';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService extends ModelService<ProductCategory> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['category_name', 'category_description'];

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
          options: { where: { product_category: job.id } },
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

  async createCategoryXls(job: Job): Promise<JobResponse> {
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
      const worksheet = workbook.addWorksheet('Category');

      worksheet.addRow(['Sl. No', 'Image', 'Title', 'Description', 'Status']);

      const categories: ProductCategory[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        categories.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x.category_image,
            x.category_name,
            x.category_description,
            x.status === 'Y' ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Image', key: 'category_image', width: 25 },
        { header: 'Title', key: 'category_name', width: 25 },
        { header: 'Description', key: 'category_description', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
      ];

      const folder = 'product-category-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `ProductCategories.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!categories.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
}
