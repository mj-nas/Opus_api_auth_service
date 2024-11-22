import {
  ModelService,
  SqlDeleteResponse,
  SqlJob,
  SqlService,
  SqlUpdateResponse,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import sequelize, { IncludeOptions } from 'sequelize';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { CartItemService } from '../cart-item/cart-item.service';
import { ProductReviewService } from '../product-review/product-review.service';
import { ReferredProductsService } from '../referred-products/referred-products.service';
import { Products } from './entities/products.entity';

@Injectable()
export class ProductsService extends ModelService<Products> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [
    'product_name',
    'product_price',
    'wholesale_price',
    'product_description',
  ];

  constructor(
    db: SqlService<Products>,
    private _productReviewService: ProductReviewService,
    private cartItemService: CartItemService,
    private referredProductsService: ReferredProductsService,
  ) {
    super(db);
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<Products>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAll') {
      if (job.options?.where && 'deleted_at' in job.options.where) {
        job.options.paranoid = false;
      }
      if (
        job.options?.where[Symbol.for('or')] &&
        job.options.where[Symbol.for('or')][0].deleted_at
      ) {
        job.options.paranoid = false;
      }
    }
  }

  /**
   * doBeforeRead
   * @function function will execute before findAll, getCount, findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeRead(job: SqlJob<Products>): Promise<void> {
    await super.doBeforeRead(job);
    const include = job.options.include
      ? (job.options.include as IncludeOptions[])
      : [];

    // Populate
    const image = include.findIndex(
      (x) => x.association === 'product_primary_image',
    );
    if (image === -1) {
      include.push({
        association: 'product_primary_image',
      });
    }

    const wishlisted = include.findIndex((x) => x.association === 'wishlisted');
    if (wishlisted > -1) {
      if (!!job.owner?.id) {
        include[wishlisted].where = {
          ...include[wishlisted].where,
          user_id: job.owner.id,
        };
        include[wishlisted].required = false;
      } else {
        include.splice(wishlisted, 1);
      }
    }

    job.options.include = include;
  }

  /**
   * doAfterDelete
   * @function function will execute after delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterDelete(
    job: SqlJob<Products>,
    response: SqlDeleteResponse<Products>,
  ): Promise<void> {
    await super.doAfterDelete(job, response);

    // Delete cart items
    await this.cartItemService.$db.deleteBulkRecords({
      options: {
        where: { product_id: response.data.id },
      },
    });
    // Delete Referred Products
    await this.referredProductsService.$db.deleteBulkRecords({
      options: {
        where: { product_id: response.data.id },
      },
    });
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<Products>,
    response: SqlUpdateResponse<Products>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    const { status } = response.data;
    const { status: previousStatus } = response.previousData;
    if (status !== previousStatus && status === 'N') {
      await this.cartItemService.$db.deleteBulkRecords({
        options: {
          where: { product_id: response.data.id },
        },
      });
      await this.referredProductsService.$db.deleteBulkRecords({
        options: {
          where: { product_id: response.data.id },
        },
      });
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
      const worksheet = workbook.addWorksheet('Products');

      worksheet.addRow([
        'Sl. No',
        'Product Name',
        'Price',
        'Wholesale Price',
        'Category Name',
        'Description',
        'Created On',
        'Status',
        'Featured',
      ]);

      const products: Products[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        products.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.product_name,
            `$${x.product_price.toFixed(2)}`,
            `$${x.wholesale_price.toFixed(2)}`,
            x?.productCategory?.category_name,
            x?.product_description,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x.deleted_at ? 'Deleted' : x.status == 'Y' ? 'Active' : 'Inactive',
            x.is_featured == 'Y' ? 'Yes' : 'No',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Product Name', key: 'product_name', width: 25 },
        { header: 'Price', key: 'product_price', width: 25 },
        { header: 'Wholesale Price', key: 'wholesale_price', width: 25 },
        { header: 'Category Name', key: 'category_name', width: 25 },
        { header: 'Description', key: 'product_description', width: 50 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
        { header: 'Featured', key: 'is_featured', width: 25 },
      ];

      const file_dir = config().cdnPath + '/product-excel';
      const file_baseurl = config().cdnLocalURL + 'product-excel';

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `OPUS-ProductManagement.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!products.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async getFeaturedProducts(job: Job): Promise<JobResponse> {
    try {
      const include: IncludeOptions[] = [
        { association: 'product_primary_image' },
      ];
      if (!!job.owner?.id) {
        include.push({
          association: 'wishlisted',
          where: { user_id: job.owner.id },
          required: false,
        });
      }
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: -1,
          order: [['created_at', 'desc']],
          where: { status: 'Y', is_featured: 'Y' },
          include,
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async getRecommendedProducts(job: Job): Promise<JobResponse> {
    try {
      const include: IncludeOptions[] = [
        { association: 'product_primary_image' },
      ];
      if (!!job.owner?.id) {
        include.push({
          association: 'wishlisted',
          where: { user_id: job.owner.id },
          required: false,
        });
      }
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 10,
          order: [['created_at', 'desc']],
          where: { status: 'Y' },
          include: include,
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async calculateRatings(product_id: number) {
    try {
      const { data } = await this._productReviewService.$db.getAllRecords({
        options: {
          where: {
            product_id,
          },
          attributes: [
            [
              sequelize.fn(
                'ROUND',
                sequelize.fn('AVG', sequelize.col('rating')),
                1,
              ),
              'average_rating',
            ],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'total_reviews'],
          ],
          limit: -1,
        },
      });
      if (!!data && data.length) {
        const { average_rating, total_reviews } = data[0].dataValues;
        await this.$db.findAndUpdateRecord({
          body: { average_rating, total_reviews },
          options: {
            where: { id: product_id },
            paranoid: false,
          },
        });
      }
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
