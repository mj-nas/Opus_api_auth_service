import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Job } from 'src/core/core.job';
import { ProductGallery } from './entities/product-gallery.entity';

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
      const { Bucket, Key, Expires, region } = job.payload.params;
      const client = new S3Client({ region });
      const command = new PutObjectCommand({
        Bucket,
        Key,
      });
      return {
        signedUrl: getSignedUrl(client, command, { expiresIn: Expires }),
      };
    } catch (error) {
      return { error };
    }
  }

  async getSignedURL1(job: Job) {
    try {
      const data = await this.s3.getSignedUrlPromise(
        job.payload.operation,
        job.payload.params,
      );
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
