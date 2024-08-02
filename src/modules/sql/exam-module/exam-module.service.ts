import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Jimp from 'jimp';
import jsPDF from 'jspdf';
import { Op } from 'sequelize';
import { zeroPad } from 'src/core/core.utils';
import { UserExamsService } from '../user-exams/user-exams.service';
import { UserService } from '../user/user.service';
import { ExamModule } from './entities/exam-module.entity';

@Injectable()
export class ExamModuleService extends ModelService<ExamModule> {
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
        const no_of_certs = await this.userExamsService.$db.getAllRecords({
          options: {
            where: { cert_id: { [Op.ne]: null } },
            order: [['cert_id', 'desc']],
          },
        });
        let unique_id = '';
        if (no_of_certs.data.length > 0) {
          const cert_id = no_of_certs.data[0].cert_id.split('-')[1];
          unique_id = `OPUS-${parseInt(cert_id) + 1}`;
        } else {
          unique_id = `OPUS-${zeroPad('1', 5)}`;
        }

        await this.createCertificateImage(job.owner, unique_id);
        const user_exam = await this.userExamsService.update({
          owner: job.owner,
          action: 'update',
          id: response.data.exam_id,
          body: {
            is_complete: true,
            attempted_percentage: completed_percentage,
            certificate_url:
              'https://opus-dev-s3.s3.amazonaws.com/e_learning_certificate.jpg',
            cert_id: unique_id,
          },
        });
        await this.userService.update({
          owner: job.owner,
          action: 'update',
          id: user_exam.data.user_id,
          body: { learning_completed: 'Y' },
        });
      } else {
        const user_exam = await this.userExamsService.update({
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

  async createCertificateImage(user: any, name: string) {
    // genereate certificate
    const image = await Jimp.read(
      'https://opus-dev-s3.s3.amazonaws.com/e_learning_certificate.jpg',
    );
    const type = image.getExtension();
    const font = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK); // bitmap fonts

    const font2 = await Jimp.loadFont(Jimp.FONT_SANS_8_BLACK); // bitmap fonts

    const measureTextWidth = Jimp.measureText(font, user.name);
    const measureTextHeight = Jimp.measureTextHeight(
      font,
      user.name,
      measureTextWidth,
    );
    console.log(
      'measureTextWidth>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
      measureTextWidth,
    );
    console.log(
      'measureTextHeight>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
      measureTextHeight,
    );
    const localurl = this.config.get('cdnLocalURL') + '/assets/Unnamed-2.fnt';
    const font3 = await Jimp.loadFont(localurl); // bitmap fonts
    console.log('localurl>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', localurl);

    const content = `This is to certify that ${user.name} has successfully completed the course ${name}`;
    image.print(font3, 70, 110, user.name);
    image.print(font2, 70, 180, content);
    image.print(font2, 70, 190, content);
    image.print(font2, 70, 200, content);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    const Key = `certificate/${name}.${type}`;
    console.log('Key>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    image.writeAsync(Key);
    // await this.uploadToS3(buffer, Key, type);

    return Key;
  }

  async createCertificatePdf(data: object) {
    const doc = new jsPDF();

    doc.text('Hello world!', 10, 10);
    doc.save('a4.pdf');
  }

  async uploadToS3(buffer: any, Key: string, type: string): Promise<string> {
    const client = new S3Client({
      region: process.env.AWS_REGION,
    });
    console.log('client>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    });

    console.log('command>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

    await client.send(command);
    console.log('s3 response>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    // console.log(response);

    return Key;
  }
}
