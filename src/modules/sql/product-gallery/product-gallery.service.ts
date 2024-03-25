import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Job } from 'src/core/core.job';
import { ProductGallery } from './entities/product-gallery.entity';

@Injectable()
export class ProductGalleryService extends ModelService<ProductGallery> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<ProductGallery>) {
    super(db);
  }

  async getSignedURL(job: Job) {
    try {
      const { Bucket, Key, Expires, region } = job.payload.params;
      const client = new S3Client({ region });
      const command = new PutObjectCommand({
        Bucket,
        Key,
      });
      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: Expires,
      });
      return {
        signedUrl,
      };
    } catch (error) {
      return { error };
    }
  }
}
