import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { Products } from './entities/products.entity';

@Injectable()
export class ProductsService extends ModelService<Products> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['product_name'];

  constructor(db: SqlService<Products>) {
    super(db);
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
          limit: 10000,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Products');

      worksheet.addRow([
        'Sl. No',
        'Product Name',
        'Price',
        'Category Name',
        'Description',
        'Created At',
        'Status',
        'Featured',
      ]);

      const products: Products[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        products.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.product_name,
            `$${x.product_price}`,
            x?.productCategory?.category_name,
            x?.product_description,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x.status == 'Y' ? 'Active' : 'Inactive',
            x.is_featured == 'Y' ? 'Yes' : 'No',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Product Name', key: 'product_name', width: 25 },
        { header: 'Price', key: 'product_price', width: 25 },
        { header: 'Category Name', key: 'category_name', width: 25 },
        { header: 'Description', key: 'product_description', width: 50 },
        { header: 'Created At', key: 'created_at', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
        { header: 'Featured', key: 'is_featured', width: 25 },
      ];

      const file_dir = config().cdnPath + '/product-excel';
      const file_baseurl = config().cdnLocalURL + 'product-excel';

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Products.xlsx`;
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
      console.log(error);
      return { error };
    }
  }

  async getFeaturedProducts() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: -1,
          order: [['created_at', 'desc']],
          where: { status: 'Y', is_featured: 'Y' },
          include: [{ association: 'product_primary_image' }],
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async getRecommendedProducts() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 10,
          order: [['created_at', 'desc']],
          where: { status: 'Y' },
          include: [{ association: 'product_primary_image' }],
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
