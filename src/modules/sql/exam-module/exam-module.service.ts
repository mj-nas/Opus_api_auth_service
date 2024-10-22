import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Jimp from 'jimp';
import jsPDF from 'jspdf';
import * as moment from 'moment-timezone';
import sequelize from 'sequelize';
import { Job } from 'src/core/core.job';
import { getUTCDateNow, zeroPad } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { UserExamsService } from '../user-exams/user-exams.service';
import { UserService } from '../user/user.service';
import { ExamModule } from './entities/exam-module.entity';

@Injectable()
export class ExamModuleService extends ModelService<ExamModule> {
  private logger: Logger = new Logger('OrderService');

  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<ExamModule>,
    private userExamsService: UserExamsService,
    private userService: UserService,
    private config: ConfigService,
    private msClient: MsClientService,
  ) {
    super(db);
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<ExamModule>,
    response: SqlUpdateResponse<ExamModule>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    if (job.body.module_complete == true) {
      const no_of_modules = await this.$db.countAllRecords({
        options: { where: { exam_id: response.data.exam_id } },
      });
      const completed_modules = await this.$db.countAllRecords({
        options: {
          where: { exam_id: response.data.exam_id, module_complete: true },
        },
      });

      const completed_percentage = Math.round(
        (completed_modules.count / no_of_modules.count) * 100,
      );

      if (no_of_modules.count == completed_modules.count) {
        console.log(job.owner);
        this.logger.log(job.owner);

        let unique_id = '';

        const o = await this.userExamsService.findOne({
          payload: {
            attributes: ['cert_id'],
            where: sequelize.where(
              sequelize.fn('DATE', sequelize.col('created_at')),
              '=',
              sequelize.fn('DATE', sequelize.fn('NOW')),
            ),
            paranoid: false,
            order: [['id', 'DESC']],
          },
        });

        if (!o?.data?.cert_id) {
          unique_id = `OPUS-${getUTCDateNow('MMDDYY')}${zeroPad('1', 6)}`;
        } else {
          unique_id = `OPUS-${getUTCDateNow('MMDDYY')}${zeroPad((Number(o.data.cert_id.substring(11)) + 1).toString(), 6)}`;
        }

        // const no_of_certs = await this.userExamsService.$db.getAllRecords({
        //   options: {
        //     where: { cert_id: { [Op.ne]: null } },
        //     order: [['cert_id', 'desc']],
        //   },
        // });
        // if (no_of_certs.data.length > 0) {
        //   const cert_id = no_of_certs.data[0].cert_id.split('-')[1];
        //   this.logger.log(cert_id);
        //   unique_id = `OPUS-${zeroPad((parseInt(cert_id) + 1).toString(), 5)}`;
        //   this.logger.log(unique_id);
        // } else {
        //   unique_id = `OPUS-${zeroPad('1', 5)}`;
        // }

        const content = `This is to certify that ${job.owner.name} has successfully completed the e-Learning Course`;
        const cert_img = await this.createCertificateImage(
          job.owner,
          unique_id,
          content,
        );
        const cert_doc = await this.createCertificatePdf(
          job.owner,
          unique_id,
          content,
        );

        await this.userExamsService.update({
          owner: job.owner,
          action: 'update',
          id: response.data.exam_id,
          body: {
            is_complete: true,
            attempted_percentage: completed_percentage,
            certificate: cert_doc,
            certificate_img: cert_img,
            cert_id: unique_id,
            completed_date: Date.now(),
          },
        });
        await this.userService.update({
          owner: job.owner,
          action: 'update',
          id: job.owner.id,
          body: { learning_completed: 'Y' },
        });

        await this.msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              user_id: job.owner.id,
              template: 'e_learning_completed',
              skipUserConfig: true,
            },
          }),
        );
      } else {
        await this.userExamsService.update({
          owner: job.owner,
          action: 'update',
          id: response.data.exam_id,
          body: {
            attempted_percentage: completed_percentage,
          },
        });
      }
    }
  }

  async createCertificateImage(user: any, name: string, content: string) {
    try {
      // genereate certificate
      const image = await Jimp.read(
        'https://opus-dev-s3.s3.amazonaws.com/raw-certificate.jpg',
      );
      const sign = await Jimp.read(
        'https://opus-dev-s3.s3.amazonaws.com/client-signature.png',
      );
      const type = image.getExtension();

      const headFont = await Jimp.loadFont(
        this.config.get('cdnLocalURL') + '/fonts/Head.fnt',
      ); // bitmap fonts
      const contentFont = await Jimp.loadFont(
        this.config.get('cdnLocalURL') + '/fonts/content.fnt',
      ); // bitmap fonts

      const date = new Date();
      const current_date = moment(date).format('DD-MMM-YYYY');
      image.composite(sign, 1350, 1850);
      image.print(headFont, 580, 950, user.name);
      image.print(contentFont, 580, 1400, content, 1900);
      const font2 = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // bitmap fonts
      image.print(font2, 630, 2030, current_date, 1900);
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      const Key = `certificate/${name}.${type}`;
      // image.writeAsync(Key);
      await this.uploadToS3(buffer, Key, type);
      return Key;
    } catch (error) {
      return error;
    }
  }

  async createCertificatePdf(user: any, name: string, content: string) {
    //create horizontal certificate
    try {
      const image = await Jimp.read(
        'https://opus-dev-s3.s3.amazonaws.com/raw-certificate.jpg',
      );
      const img_height = image.getHeight() / 8;
      const img_width = image.getWidth() / 8;
      const doc = new jsPDF('l', 'pt', [img_width, img_height]);
      const sign = await Jimp.read(
        'https://opus-dev-s3.s3.amazonaws.com/client-signature.png',
      );

      const sign_buffer = await sign.getBufferAsync(Jimp.MIME_PNG);
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      doc.addImage(buffer, 'JPEG', 0, 0, img_width, img_height);
      doc.addImage(sign_buffer, 'PNG', 170, 230, 70, 35);
      const date = new Date();
      doc.setFontSize(8);
      doc.setFont(
        `${this.config.get('cdnLocalURL')}fonts/PlayfairDisplay-Medium.ttf`,
        'normal',
      );
      doc.text(content, 70, 180, { maxWidth: 240 });
      const current_date = moment(date).format('DD-MMM-YYYY');
      doc.setFontSize(6);
      doc.text(current_date, 85, 260);

      doc.setFontSize(14);
      doc.setFont(
        `${this.config.get('cdnLocalURL')}fonts/Jost-Light.ttf`,
        'normal',
        700,
      );
      doc.setTextColor(59, 58, 57);
      doc.text(user.name, 70, 135);
      const key = `certificate/${name}.pdf`;
      await this.uploadToS3(doc.output('arraybuffer'), key, 'pdf');
      // doc.save(key + '.pdf');
      return key;
    } catch (error) {
      return error;
    }
  }

  async uploadToS3(buffer: any, Key: string, type: string): Promise<string> {
    const client = new S3Client({
      region: process.env.AWS_REGION,
    });
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    });
    await client.send(command);
    return Key;
  }
}
