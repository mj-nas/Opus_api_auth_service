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

  async generatePresignedUrl(operation: string, bucketName: string, key: string, expiresIn: number): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    };

    return new Promise<string>((resolve, reject) => {
      this.s3.getSignedUrl(operation, params, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }
}
