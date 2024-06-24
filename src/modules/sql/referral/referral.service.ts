import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import * as QRCode from 'qrcode';
import { Job, JobResponse } from 'src/core/core.job';
import { Referral } from './entities/referral.entity';

@Injectable()
export class ReferralService extends ModelService<Referral> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Referral>) {
    super(db);
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: SqlJob<Referral>,
    response: SqlCreateResponse<Referral>,
  ): Promise<void> {
    await super.doAfterCreate(job, response);

    await this.createQRCode({ payload: { referral_id: response.data.id } });
  }

  async generateQRCode(referralLink) {
    const canvas = createCanvas(400, 400);
    await QRCode.toCanvas(canvas, referralLink, {
      errorCorrectionLevel: 'H',
      margin: 3,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return canvas.toDataURL();
  }

  async uploadToS3(dataUrl: string, uid: string): Promise<string> {
    const base64Data = Buffer.from(
      dataUrl.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );
    const type = dataUrl.split(';')[0].split('/')[1];
    const fileName = `${Date.now()}.${type}`;
    const Key = `qr-code/${uid}/${fileName}`;
    const client = new S3Client({
      region: process.env.AWS_REGION,
    });
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
      Body: base64Data,
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    });

    await client.send(command);

    return Key;
  }

  async createQRCode(job: Job): Promise<JobResponse> {
    try {
      const { referral_id } = job.payload;
      const { error, data } = await this.$db.findRecordById({
        id: +referral_id,
        options: {
          attributes: ['id', 'uid', 'referral_link'],
        },
      });

      if (error) {
        return { error };
      }

      const dataUrl = await this.generateQRCode(data.referral_link);
      const qrCodeKey = await this.uploadToS3(dataUrl, data.uid);
      data.setDataValue('qr_code', qrCodeKey);
      await data.save();

      return {
        data,
      };
    } catch (error) {
      return { error };
    }
  }
}
