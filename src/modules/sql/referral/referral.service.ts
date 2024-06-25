import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private emailTemplate: HandlebarsTemplateDelegate;

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
    private config: ConfigService,
  ) {
    super(db);
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
      credentials: {
        accessKeyId: 'AKIASV7MRPIUBKQKGVTH',
        secretAccessKey: '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',
      },
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

  async createReferrals(job: Job): Promise<JobResponse> {
    const { referred_coupons, referred_products, email } = job.payload;
    const { error, data } = await this.create({
      owner: job.owner,
      action: 'create',
      body: { email, dispenser_id: job.owner.id },
    });
    console.log(referred_coupons, referred_products);

    if (error) {
      return { error };
    }

    const dataUrl = await this.generateQRCode(data.referral_link);
    const qrCodeKey = await this.uploadToS3(dataUrl, data.uid);
    data.setDataValue('qr_code', qrCodeKey);
    await data.save();

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
      this.emailTemplate = handlebars.compile(template);
    } catch (error) {
      this.emailTemplate = handlebars.compile('<div>{{{content}}}</div>');
    }
    const _email_template = this.emailTemplate({
      banner_img: this.config.get('cdnLocalURL') + 'assets/banner.png',
      footer_img: this.config.get('cdnLocalURL') + 'assets/ft_img.png',
      referral_link: data.referral_link,
      qr_link: data.qr_code,
      coupons: referred_coupons,
      products: referred_products.map((e: any) => ({
        ...e,
        url: `${process.env.WEBSITE_URL}/products/${e.slug}`,
      })),
    });

    await this.msClient.executeJob(
      'controller.email',
      new Job({
        action: 'sendMail',
        payload: {
          to: email,
          subject: "You've been referred",
          html: _email_template,
        },
      }),
    );

    return {
      data: {},
    };
  }
}
