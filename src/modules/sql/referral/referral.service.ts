import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { readFileSync } from 'fs';
import { handlebars } from 'hbs';
import { join } from 'path';
import * as QRCode from 'qrcode';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { ReferredCouponService } from '../referred-coupon/referred-coupon.service';
import { ReferredProductsService } from '../referred-products/referred-products.service';
import { Referral } from './entities/referral.entity';

@Injectable()
export class ReferralService extends ModelService<Referral> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<Referral>,
    private referredProductService: ReferredProductsService,
    private referredCouponService: ReferredCouponService,
    private msClient: MsClientService,
  ) {
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

  async createReferrals(job: Job): Promise<JobResponse> {
    const { referred_coupons, referred_products, ...referral_body } =
      job.payload;
    console.log(referral_body);
    const { error, data } = await this.create({
      owner: job.owner,
      action: 'create',
      body: referral_body,
    });
    if (error) {
      return { error };
    }

    if (data.id) {
      const coupon_data = referred_coupons.map((e) => {
        return {
          referral_id: data.id,
          coupon_id: e.id,
        };
      });
      const product_data = referred_products.map((e) => {
        return {
          referral_id: data.id,
          product_id: e.id,
        };
      });

      const referredCoupons =
        await this.referredCouponService.$db.createBulkRecords({
          owner: job.owner,
          options: {},
          records: coupon_data,
        });

      const referredProducts =
        await this.referredProductService.$db.createBulkRecords({
          owner: job.owner,
          options: {},
          records: product_data,
        });

      if (referredCoupons.error || referredProducts.error) {
        return {
          error: referredCoupons.error || referredProducts.error,
        };
      }

      try {
        const template = readFileSync(
          join(__dirname, '../src', 'views/referral.hbs'),
          'utf8',
        );
        const emailTemplate = handlebars.compile(template);
      } catch (error) {
        const emailTemplate = handlebars.compile('<div>{{{content}}}</div>');
      }

      // await this.msClient.executeJob(
      //   'controller.email',
      //   new Job({
      //     action: 'sendMail',
      //     payload: {
      //       to: data.email,
      //       subject: _email_subject,
      //       html: _email_template,
      //     },
      //   }),
      // );

      return {
        data: {
          ...data.dataValues,
          referredCoupons: referredCoupons.data,
          referredProducts: referredProducts.data,
        },
      };
    }
  }
}
