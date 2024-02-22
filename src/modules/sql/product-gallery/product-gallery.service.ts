import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ProductGallery } from './entities/product-gallery.entity';
import { Job } from 'src/core/core.job';
import * as AWS from 'aws-sdk';


@Injectable()
export class ProductGalleryService extends ModelService<ProductGallery> {

  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];
  private readonly s3: AWS.S3;

  constructor(db: SqlService<ProductGallery>) {
    super(db);
    this.s3 = new AWS.S3();
    
  }


  async getSignedURL(job: Job) {
    try {
      const data = await this.s3.getSignedUrlPromise(job.payload.operation, job.payload.params);
      return { data };
    } catch (error) {
      return { error };
    }
  }

}
