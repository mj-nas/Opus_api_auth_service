import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlService } from '@core/sql';
import { TinyUrlService } from '@core/tinyurl';
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
    private _tinyUrlService: TinyUrlService,
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

  // with new simple email template
  async createReferrals(job: Job): Promise<JobResponse> {
    const { referred_coupons, referred_products, email } = job.payload;
    // const colours = ['#AA674F', '#E8AE9A', '#CFAFA4', '#FFFEDB', '#C4946B'];
    // const colours = [
    //   { bgColor: '#AA674F', textColor: '#FFFFFF' },
    //   { bgColor: '#E8AE9A', textColor: '#FFFFFF' },
    //   { bgColor: '#CFAFA4', textColor: '#FFFFFF' },
    //   { bgColor: '#FFFEDB', textColor: '#000000' },
    //   { bgColor: '#C4946B', textColor: '#FFFFFF' },
    // ];
    const { error, data } = await this.create({
      owner: job.owner,
      action: 'create',
      body: { email, dispenser_id: job.owner.id },
    });

    if (error) {
      return { error };
    }

    const tinyUrlResponse = await this._tinyUrlService.shortenUrl({
      payload: { url: `${process.env.WEBSITE_URL}/referral/${data.uid}` },
    });
    if (!tinyUrlResponse.error && tinyUrlResponse.data?.alias) {
      data.setDataValue('tiny_url_alias', tinyUrlResponse.data?.alias);
      await data.save();
    }

    const dataUrl = await this.generateQRCode(data.referral_link);
    const qrCodeKey = await this.uploadToS3(dataUrl, data.uid);
    data.setDataValue('qr_code', qrCodeKey);
    await data.save();

    if (referred_coupons && referred_coupons.length > 0) {
      const coupon_data = referred_coupons.map((e) => {
        return {
          referral_id: data.id,
          coupon_id: e.id,
        };
      });
      const referredCoupons =
        await this.referredCouponService.$db.createBulkRecords({
          owner: job.owner,
          options: {},
          records: coupon_data,
        });

      if (referredCoupons.error) {
        return {
          error: referredCoupons.error,
        };
      }
    }
    if (referred_products && referred_products.length > 0) {
      const product_data = referred_products.map((e) => {
        return {
          referral_id: data.id,
          product_id: e.id,
        };
      });
      const referredProducts =
        await this.referredProductService.$db.createBulkRecords({
          owner: job.owner,
          options: {},
          records: product_data,
        });

      if (referredProducts.error) {
        return {
          error: referredProducts.error,
        };
      }
    }

    try {
      const template = readFileSync(
        join(__dirname, '../src', 'views/referral.hbs'),
        'utf8',
      );
      handlebars.registerHelper('checkLength', function (array) {
        if (array.length > 1) {
          return 'These products were recommended by your personal Opus Dispenser';
        } else {
          return 'This product was recommended by your personal Opus Dispenser';
        }
      });
      this.emailTemplate = handlebars.compile(template);
    } catch (error) {
      this.emailTemplate = handlebars.compile('<div>{{{content}}}</div>');
    }
    const _email_template = this.emailTemplate({
      referral_link: data.referral_link,
      qr_link: data.qr_code,
      coupons: referred_coupons ? referred_coupons : [],
    });

    let products = ``;
    referred_products.forEach((item) => {
      products += `<tr style="border-bottom: 1px solid rgb(66, 68, 66);">
                      <td>
                        <img style="width: 100px; height: 100px" width="100" height="100"
                          src="${item.product_image}"
                          alt="Product Image" />
                      </td>
                      <td style="font-size: 14px;">
                        ${item.name}
                      </td>
                      <td style="text-align: center;"><a href="${`${process.env.WEBSITE_URL}/products/${item.slug}?r=${data.uid}`}"><p style="background-color: #28D0B0; width: 80%; font-size: 14px; font-weight: 600;"><b>Shop now</b></p></a></td>
                   </tr>
                                    `;
    });
    const DISPENSER_OF_BUSINESS_NAME = `${job.owner.name} ${job.owner.business_name ? `of ${job.owner.business_name}` : ''}`;
    const DISPENSER_FROM_BUSINESS_NAME = `<b>${job.owner.name}</b> ${job.owner.business_name ? `from <b>${job.owner.business_name}</b>` : ''}`;

    await this.msClient.executeJob(
      'controller.notification',
      new Job({
        action: 'send',
        payload: {
          skipUserConfig: true,
          users: [
            {
              name: 'user.name',
              email: email,
              send_email: true,
            },
          ],
          template: 'referral_template',
          variables: {
            REFERRAL_LINK: data.referral_link,
            QR_LINK: data.qr_code,
            DISPENSER_OF_BUSINESS_NAME,
            DISPENSER_FROM_BUSINESS_NAME,
            COUPON_CODE: referred_coupons[0].code,
            PRODUCTS: products,
          },
        },
      }),
    );

    return {
      data: {},
    };
  }
}
