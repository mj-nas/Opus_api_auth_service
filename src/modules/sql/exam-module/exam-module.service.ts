import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ModelService, SqlJob, SqlService, SqlUpdateResponse } from '@core/sql';
import { Injectable } from '@nestjs/common';
import Jimp from 'jimp';
import { Op } from 'sequelize';
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
        // this.createCertificateImage(job.owner.name);
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
          const user_exam = await this.userExamsService.update({
            owner: job.owner,
            action: 'update',
            id: response.data.exam_id,
            body: {
              is_complete: true,
              attempted_percentage: completed_percentage,
              certificate_url: `https://opus-dev-s3.s3.amazonaws.com/certificates/${unique_id}.jpg`,
            },
          });
          await this.userService.update({
            owner: job.owner,
            action: 'update',
            id: user_exam.data.user_id,
            body: { learning_completed: 'Y' },
          });
        }
        unique_id = `OPUS-`;
        const user_exam = await this.userExamsService.update({
          owner: job.owner,
          action: 'update',
          id: response.data.exam_id,
          body: {
            is_complete: true,
            attempted_percentage: completed_percentage,
            certificate_url:
              'https://opus-dev-s3.s3.amazonaws.com/e_learning_certificate.jpg',
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

  async createCertificateImage(name: string) {
    // genereate certificate
    const image = await Jimp.read(
      'https://opus-dev-s3.s3.amazonaws.com/e_learning_certificate.jpg',
    );
    const type = image.getExtension();
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE); // bitmap fonts
    image.print(font, 10, 10, name);
    console.log('image', image.getExtension());
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('type', type);

    return image.getBase64Async(Jimp.MIME_JPEG);
  }

  async createCertificatePdf(data: object) {}

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
}
