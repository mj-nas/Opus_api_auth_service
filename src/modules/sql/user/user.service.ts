import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  ModelService,
  SqlCreateResponse,
  SqlDeleteResponse,
  SqlJob,
  SqlService,
  SqlUpdateResponse,
} from '@core/sql';
import { TinyUrlService } from '@core/tinyurl';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCanvas } from 'canvas';
import { CsvError, parse } from 'csv-parse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import * as QRCode from 'qrcode';
import { Op, literal } from 'sequelize';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { compareHash, generateHash, otp } from 'src/core/core.utils';
import { OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { OtpSessionType } from 'src/modules/mongo/otp-session/entities/otp-session.entity';
import { OtpSessionService } from 'src/modules/mongo/otp-session/otp-session.service';
import { ZodError, z } from 'zod';
import { AddressService } from '../address/address.service';
import { SignupDto } from '../auth/dto/signup.dto';
import {
  generateRandomPassword,
  parseStringWithWhitespace,
  trimAndValidateCustom,
} from './../../../core/core.utils';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { User } from './entities/user.entity';
import { Role } from './role.enum';
import { Status } from './status.enum';

@Injectable()
export class UserService extends ModelService<User> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [
    'name',
    'email',
    'business_name',
    '$dispenser.name$',
    'phone',
    'address',
    'address2',
    'city',
    'state',
    'zip_code',
  ];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['dispenser'];

  constructor(
    db: SqlService<User>,
    private msClient: MsClientService,
    @Inject(forwardRef(() => AddressService))
    private addressService: AddressService,
    private config: ConfigService,
    private otpSessionService: OtpSessionService,
    private _tinyUrlService: TinyUrlService,
  ) {
    super(db);
  }

  /**
   * doBeforeCount
   * @function function will execute before getCount function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeCount(job: SqlJob<User>): Promise<void> {
    await super.doBeforeCount(job);
    if (job.action === 'assignedCustomersCount') {
      job.options.where = { ...job.options.where, role: Role.Customer };
    }
  }

  /**
   * doBeforeUpdate
   * @function function will execute before update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeUpdate(job: SqlJob<User>): Promise<void> {
    await super.doBeforeUpdate(job);
    if (job.action === 'updateMe') {
      if (job.payload?.email !== job.owner.email) {
      }
    }
    if (job.action === 'updateDispenser') {
      const user = await this.$db.findRecordById({ id: job.id });
      if (user.error) {
        throw new Error(user.error);
      }
      if (user.data.dispenser_id == job.body.dispenser_id) {
        throw new Error('dispenser already exists');
      }
    }
  }

  /**
   * change user password
   * @param job
   * @returns Promise<JobResponse>
   */
  async changePassword(job: Job): Promise<JobResponse> {
    // eslint-disable-next-line prefer-const
    let { owner, payload } = job;

    const password = await generateHash(payload.password);
    if (!(await compareHash(payload.old_password, owner.password))) {
      return { error: 'Your current password is wrong. Please try again.' };
    }

    //check password and old password are same
    if (await compareHash(payload.password, owner.password)) {
      return {
        error:
          'Your new password cannot be the same as your current password. Please choose a different password.',
      };
    }

    try {
      const userResult = await this.$db.updateRecord({
        action: 'findById',
        id: owner.id,
        body: {
          password,
          force_password_change: false,
        },
      });

      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: owner.id,
            template: 'change_password',
            skipUserConfig: true,
            variables: {
              TO_NAME: userResult.data.name,
              USERNAME: userResult.data.email,
              PASSWORD: payload.password,
            },
          },
        }),
      );
      return userResult;
    } catch (error) {
      return { error };
    }
  }

  /**
   * change user password
   * @param job
   * @returns Promise<JobResponse>
   */
  async changePasswordByAdmin(job: Job): Promise<JobResponse> {
    const { payload } = job;

    const password = await generateHash(payload.password);
    try {
      const { data, error } = await this.$db.updateRecord({
        action: 'updateRecord',
        id: payload.user_id,
        body: {
          password,
          force_password_change: true,
        },
      });

      if (!!error) return { error };

      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: payload.user_id,
            template: 'change_password_by_admin',
            skipUserConfig: true,
            variables: {
              TO_NAME: data.name,
              USERNAME: data.email,
              PASSWORD: payload.password,
            },
          },
        }),
      );

      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * doAfterUpdate
   * @function function will execute after update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterUpdate(
    job: SqlJob<User>,
    response: SqlUpdateResponse<User>,
  ): Promise<void> {
    await super.doAfterUpdate(job, response);
    if (job.action === 'updateDispenser') {
      const { dispenser_id, connection_via, id } = response.data;
      const previous_dispenser_id = response.previousData.dispenser_id;
      await this.msClient.executeJob('user.dispenser.change', {
        owner: job.owner,
        payload: {
          user_id: id,
          previous_dispenser_id,
          dispenser_id,
          connection_via,
        },
      });
      // // send maiil to dispenser
      // await this.msClient.executeJob(
      //   'controller.notification',
      //   new Job({
      //     action: 'send',
      //     payload: {
      //       user_id: dispenser_id,
      //       template: 'customer_added_dispenser',
      //       skipUserConfig: true,
      //       variables: {
      //         CUSTOMER_NAME: response.data.name,
      //         CUSTOMER_CONTACT_INFO: response.data.email,
      //       },
      //     },
      //   }),
      // );
      // const { error, data: userData } = await this.findById({
      //   action: 'findById',
      //   id,
      //   payload: { populate: ['dispenser'] },
      // });
      // if (error) {
      //   throw new Error(error);
      // }
      // // send maiil to customer
      // await this.msClient.executeJob(
      //   'controller.notification',
      //   new Job({
      //     action: 'send',
      //     payload: {
      //       user_id: id,
      //       template: 'dispenser_added_customer',
      //       skipUserConfig: true,
      //       variables: {
      //         DISPENSER_NAME: userData.dispenser.name,
      //         DISPENSER_CONTACT_INFO: userData.dispenser.email,
      //       },
      //     },
      //   }),
      // );
    }
    const { active, id, status, email, role } = response.data;
    const { active: previousActive, status: previousStatus } =
      response.previousData;

    // check if the status changed
    if (previousActive !== active) {
      const currentStatus = active ? 'activated' : 'deactivated';
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            template: 'account_status_update',
            variables: {
              STATUS: currentStatus,
            },
            skipUserConfig: true,
            user_id: id,
          },
        }),
      );

      if (!active) {
        // send socket notification to the user
        this.msClient.executeJob('controller.socket-event', {
          action: 'userBlocked',
          payload: {
            user_id: id,
          },
        });

        if (role === Role.Dispenser) {
          await this.$db.updateBulkRecords({
            body: { dispenser_id: null, connection_via: null },
            options: {
              where: { dispenser_id: id },
            },
          });
        }
      }
    }

    // check previous state of user
    if (previousStatus !== status) {
      if (status === Status.Deny) {
        await this.msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              template: 'dispenser_application_deny',
              variables: {
                STATUS: status,
              },
              skipUserConfig: true,
              user_id: id,
            },
          }),
        );
      } else if (status === Status.Approve) {
        const password = generateRandomPassword(10);
        const passwordHash = await generateHash(password);
        await this.$db.updateRecord({
          action: 'findById',
          id,
          body: {
            password: passwordHash,
          },
        });
        await this.msClient.executeJob(
          'controller.notification',
          new Job({
            action: 'send',
            payload: {
              template: 'dispenser_application_approve',
              variables: {
                STATUS: status,
                USERNAME: email,
                PASSWORD: password,
                LOGIN_LINK: process.env.WEBSITE_URL + '/auth/signin',
              },
              skipUserConfig: true,
              user_id: id,
            },
          }),
        );
      }
    }
  }

  /**
   * doAfterDelete
   * @function function will execute after delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterDelete(
    job: SqlJob<User>,
    response: SqlDeleteResponse<User>,
  ): Promise<void> {
    await super.doAfterDelete(job, response);
    const { id } = response.data;
    this.msClient.executeJob('controller.socket-event', {
      action: 'userDeleted',
      payload: {
        user_id: id,
      },
    });
  }

  /**
   * doBeforeFindAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  protected async doBeforeFindAll(job: SqlJob<User>): Promise<void> {
    await super.doBeforeFindAll(job);
    if (job.action === 'findAllCustomer') {
      job.options.where = {
        ...job.options.where,
        role: Role.Customer,
      };
    } else if (job.action === 'findAllDispenser') {
      job.options.where = {
        ...job.options.where,
        role: Role.Dispenser,
        status: Status.Approve,
      };
      if (job.options.where.deleted_at) {
        job.options.paranoid = false;
      }
    } else if (job.action === 'findAllDispenserApplicant') {
      job.options.where = {
        status: {
          [Op.in]: [Status.Pending, Status.Deny, Status.Approve],
        },
        ...job.options.where,
        role: Role.Dispenser,
        created_by: { [Op.eq]: null },
      };
    } else if (job.action === 'findARep') {
      job.options.where = {
        ...job.options.where,
        role: Role.Dispenser,
        status: Status.Approve,
        learning_completed: 'Y',
        active: true,
        geotag: true,
      };
      job.options.order = [['name', 'asc']];
      const attributes = job.options.attributes
        ? { ...job.options.attributes, include: [] }
        : { include: [] };

      if (job.options.where.latitude && job.options.where.longitude) {
        attributes.include.push([
          literal(
            `ROUND((${
              config().distanceUnitCalculationNumber
            } * acos(cos(radians(${
              job.options.where.latitude
            })) * cos(radians(User.latitude)) * cos(radians(${
              job.options.where.longitude
            }) - radians(User.longitude)) + sin(radians(${
              job.options.where.latitude
            })) * sin(radians(User.latitude)))), 1)`,
          ),
          'distance',
        ]);
        job.options.order.unshift(['distance', 'asc']);
        delete job.options.where.latitude;
        delete job.options.where.longitude;
      }

      job.options.attributes = attributes;
    } else if (job.action === 'findAllMyReferrals') {
      job.options.where = {
        ...job.options.where,
        role: Role.Customer,
        dispenser_id: job.owner.id,
      };
    }
  }

  /**
   * doAfterCreate
   * @function function will execute after create function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  protected async doAfterCreate(
    job: SqlJob<User>,
    response: SqlCreateResponse<User>,
  ): Promise<void> {
    await super.doAfterCreate(job, response);
    const {
      id,
      uid,
      role,
      first_name,
      last_name,
      phone,
      email,
      address,
      address2,
      city,
      state,
      zip_code,
      name,
    } = response.data;
    await this.addressService.create({
      action: 'create',
      body: {
        user_id: id,
        first_name,
        last_name,
        phone,
        email,
        address,
        address2,
        city,
        state,
        zip_code,
        is_primary: 'Y',
      },
    });

    if (role === Role.Dispenser) {
      const { error, data } = await this._tinyUrlService.shortenUrl({
        payload: { url: `${process.env.WEBSITE_URL}/connect/${uid}` },
      });
      if (!error && data?.alias) {
        response.data.setDataValue('tiny_url_alias', data?.alias);
        const dataUrl = await this.generateQRCode(response.data.referral_link);
        const qrCodeKey = await this.uploadToS3(dataUrl, uid);
        response.data.setDataValue('qr_code', qrCodeKey);
        await response.data.save();
      }
    }

    if (job.action == 'createDispenser') {
      const password = generateRandomPassword(10);
      const passwordHash = await generateHash(password);
      await this.$db.updateRecord({
        action: 'findById',
        id: id,
        body: {
          password: passwordHash,
          force_password_change: true,
        },
      });

      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            user_id: id,
            template: 'dispenser_account_created',
            skipUserConfig: true,
            variables: {
              TO_NAME: name,
              USERNAME: email,
              PASSWORD: password,
              LOGIN_LINK: process.env.WEBSITE_URL + '/auth/signin',
            },
          },
        }),
      );
    }
  }

  async createCustomerXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
      const timezone: string = payload.timezone;
      delete payload.timezone;
      const { error, data } = await this.findAll({
        owner,
        action: 'findAllCustomer',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customer');

      worksheet.addRow([
        'Sl. No',
        'First Name',
        'Last Name',
        'Email',
        'Dispenser',
        'Phone',
        'Address 1',
        'Address 2',
        'City',
        'State',
        'Zip Code',
        'Created On',
        'Status',
      ]);

      const users: User[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.first_name,
            x?.last_name,
            x.email,
            x?.dispenser?.name,
            `${x.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`,
            x?.address,
            x?.address2,
            x?.city,
            x?.state,
            x?.zip_code,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.active ? 'Active' : 'Inactive',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'First Name', key: 'first_name', width: 25 },
        { header: 'Last Name', key: 'last_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Dispenser', key: 'referred_by', width: 50 },
        { header: 'Phone', key: 'phone', width: 50 },
        { header: 'Address 1', key: 'address', width: 50 },
        { header: 'Address 2', key: 'address2', width: 50 },
        { header: 'City', key: 'city', width: 50 },
        { header: 'State', key: 'state', width: 50 },
        { header: 'Zip Code', key: 'zip_code', width: 25 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
      ];

      const folder = 'customer-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Customer.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!users.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }
  async createApplicantXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
      const timezone: string = payload.timezone;
      delete payload.timezone;
      const { error, data } = await this.findAll({
        owner,
        action: 'findAllDispenserApplicant',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Applicant');

      worksheet.addRow([
        'Sl. No',
        'Name',
        'Business Name',
        'Email',
        'Phone',
        'Address 1',
        'Address 2',
        'City',
        'State',
        'Zip Code',
        'Created On',
        'Status',
      ]);

      const users: User[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.name,
            x?.business_name,
            x.email,
            `${x.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`,
            x?.address,
            x?.address2,
            x?.city,
            x?.state,
            x?.zip_code,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY hh:mm A'),
            x?.status == Status.Deny
              ? 'Denied'
              : x?.status == Status.Approve
                ? 'Approved'
                : x?.status == Status.Pending
                  ? 'Pending'
                  : x?.status,
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Business Name', key: 'buisiness_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 50 },
        { header: 'Address 1', key: 'address', width: 50 },
        { header: 'Address 2', key: 'address2', width: 50 },
        { header: 'City', key: 'city', width: 50 },
        { header: 'State', key: 'state', width: 50 },
        { header: 'Zip Code', key: 'zip_code', width: 15 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
      ];

      const folder = 'applicant-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Applicant.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!users.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async createDispenserXls(job: Job): Promise<JobResponse> {
    try {
      const { owner, payload } = job;
      const timezone: string = payload.timezone;
      delete payload.timezone;
      const { error, data } = await this.findAll({
        owner,
        action: 'findAllDispenser',
        payload: {
          ...payload,
          offset: 0,
          limit: -1,
        },
      });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Dispenser');

      worksheet.addRow([
        'Sl. No',
        'First Name',
        'Last Name',
        'Business Name',
        'Email',
        'Phone',
        'Address 1',
        'Address 2',
        'Geotag',
        'Unique URL',
        'QR Code',
        'Created On',
        'Created By',
        'Status',
        'E-Learning Status',
      ]);

      const users: User[] = JSON.parse(JSON.stringify(data));

      await Promise.all(
        users.map(async (x, index) => {
          worksheet.addRow([
            index + 1,
            x?.first_name,
            x?.last_name,
            x.business_name ? x.business_name : 'Not Applicable',
            x.email,
            `${x.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`,
            x?.address,
            x?.address2,
            x.geotag ? 'Yes' : 'No',
            x.referral_link,
            x.qr_code,
            moment(x.created_at).tz(timezone).format('MM/DD/YYYY, hh:mm A'),
            x.created_by == 1 ? 'Admin' : 'Applicant',
            x?.active ? 'Active' : 'Inactive',
            x?.learning_completed == 'Y'
              ? 'Training Completed'
              : 'Awaiting Training Completion',
          ]);
        }),
      );

      worksheet.columns = [
        { header: 'Sl. No', key: 'sl_no', width: 25 },
        { header: 'First Name', key: 'first_name', width: 25 },
        { header: 'Last Name', key: 'last_name', width: 25 },
        { header: 'Business Name', key: 'business_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 25 },
        { header: 'Address 1', key: 'address', width: 50 },
        { header: 'Address 2', key: 'address2', width: 50 },
        { header: 'Geotag', key: 'geotag', width: 25 },
        { header: 'Unique URL', key: 'unique_url', width: 25 },
        { header: 'QR Code', key: 'qr_code', width: 25 },
        { header: 'Created On', key: 'created_at', width: 25 },
        { header: 'Created By', key: 'created_by', width: 25 },
        { header: 'Status', key: 'active', width: 25 },
        { header: 'E-Learning Status', key: 'learning_completed', width: 25 },
      ];

      const folder = 'dispenser-excel';
      const file_dir = config().cdnPath + `/${folder}`;
      const file_baseurl = config().cdnLocalURL + `/${folder}`;

      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir);
      }
      const filename = `Dispenser.xlsx`;
      const full_path = `${file_dir}/${filename}`;
      await workbook.xlsx.writeFile(full_path);
      return {
        data: {
          url: `${file_baseurl}/${filename}`,
          filename,
          isData: !!users.length,
        },
      };
    } catch (error) {
      return { error };
    }
  }

  async parseFile(
    fileContent: string | Buffer,
    headers: string[],
  ): Promise<{ error?: CsvError; records?: any }> {
    return new Promise((resolve) => {
      parse(
        fileContent,
        {
          delimiter: ',',
          columns: headers,
        },
        (error, records) => {
          if (error) {
            resolve({ error });
          } else {
            resolve({ records });
          }
        },
      );
    });
  }

  async importDispenserExcel(job: Job): Promise<JobResponse> {
    try {
      const { payload } = job;
      const csvFilePath = payload?.csv_file[0]?.path;
      const headers = [
        'FIRST_NAME',
        'LAST_NAME',
        'BUSINESS_NAME',
        'EMAIL',
        'PHONE',
        'LATITUDE',
        'LONGITUDE',
        'ADDRESS',
        'ADDRESS2',
        'CITY',
        'STATE',
        'COUNTRY',
        'ZIP_CODE',
      ];
      const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
      fs.unlinkSync(csvFilePath);

      const { error, records } = await this.parseFile(fileContent, headers);
      if (!!error) {
        return { error };
      }
      if (records?.length <= 1) {
        return { error: 'Invalid csv format' };
      }

      const mandatoryFields = z.object({
        FIRST_NAME: z
          .string()
          .min(1, { message: 'Please enter your first name.' })
          .max(30, 'Your last name exceeds the character limit.')
          .refine((value) => !/^\s|\s$/.test(value), {
            message: 'Leading or trailing white spaces are not allowed',
          })
          .refine((value) => /^[a-zA-Z]+$/.test(value), {
            message:
              'Please enter a valid first name. Numbers are not allowed.',
          }),
        LAST_NAME: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your last name.' })
            .max(30, 'Your last name exceeds the character limit.'),
        ),
        BUSINESS_NAME: parseStringWithWhitespace(
          z
            .string()
            .max(100, 'Your business name exceeds the character limit.'),
        ),
        EMAIL: z
          .string()
          .min(1, { message: 'Please enter your email address.' })
          .email('Please enter a valid email.'),
        PHONE: z
          .string()
          .regex(new RegExp(/^\d{10}$/), 'Invalid phone number!'),
        LATITUDE: z
          .string()
          .regex(
            new RegExp(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/),
            'Invalid Latitude!',
          ),
        LONGITUDE: z
          .string()
          .regex(
            new RegExp(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/),
            'Invalid Longitude!',
          ),
        ADDRESS: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your address.' })
            .max(100, 'Your address exceeds the character limit.'),
        ),
        ADDRESS2: parseStringWithWhitespace(
          z.string().max(100, 'Your address exceeds the character limit.'),
        ),
        CITY: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your city.' })
            .max(30, 'Your city exceeds the character limit.'),
        ),
        STATE: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your state.' })
            .max(30, 'Your state exceeds the character limit.'),
        ),
        COUNTRY: z.string(),
        ZIP_CODE: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your zip code.' })
            .max(10, 'Your zip code exceeds the character limit.'),
        ),
      });
      const schema = z.preprocess(
        (args) => {
          return { mandatory: args };
        },
        z.object({
          mandatory: mandatoryFields,
        }),
      );

      // Remove first element from an array
      records.shift();
      const import_status = { success: [], failed: [] };
      for (let index = 0; index < records.length; index++) {
        const user = records[index];
        const password = generateRandomPassword(10);
        try {
          schema.parse(user);
          const body = {
            role: Role.Dispenser,
            first_name: user.FIRST_NAME,
            last_name: user.LAST_NAME,
            business_name: user?.BUSINESS_NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            latitude: user.LATITUDE,
            longitude: user.LONGITUDE,
            address: user.ADDRESS,
            address2: user.ADDRESS2,
            city: user.CITY,
            state: user.STATE,
            country: user.COUNTRY,
            zip_code: user.ZIP_CODE,
            password,
            status: Status.Approve,
            force_password_change: true,
          };
          const { errors } = await trimAndValidateCustom(
            CreateDispenserDto,
            body,
            ['password', 'role', 'status'],
          );
          if (!!errors) {
            import_status.failed.push({
              ...user,
              error: errors.flatMap((err) => ({
                path: [err.property?.toUpperCase()],
                message: err.constraints[Object.keys(err.constraints)[0]],
              })),
            });
            continue;
          }
          const { error, data } = await this.create({
            action: 'import',
            owner: job.owner,
            body,
          });
          if (!!error) {
            import_status.failed.push({
              ...user,
              error: [
                {
                  message: error.message || error,
                  path: ['server'],
                },
              ],
            });
            continue;
          }

          await this.msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                user_id: data.id,
                template: 'dispenser_account_created',
                skipUserConfig: true,
                variables: {
                  TO_NAME: data.name,
                  USERNAME: data.email,
                  PASSWORD: password,
                  LOGIN_LINK: process.env.WEBSITE_URL + '/auth/signin',
                },
              },
            }),
          );

          import_status.success.push({ ...user });
        } catch (error) {
          if (error instanceof ZodError) {
            const issues = error.issues;
            import_status.failed.push({
              ...user,
              error: issues.flatMap((i) => {
                return {
                  message: i.message,
                  path: i.path.filter((x) => x !== 'mandatory'),
                };
              }),
            });
          }
        }
      }
      return { data: import_status };
    } catch (error) {
      return { error };
    }
  }

  async importExcel(job: Job): Promise<JobResponse> {
    try {
      const { payload } = job;
      const csvFilePath = payload?.csv_file[0]?.path;
      const headers = [
        'FIRST_NAME',
        'LAST_NAME',
        'EMAIL',
        'PHONE',
        'ADDRESS',
        'ADDRESS2',
        'CITY',
        'STATE',
        'COUNTRY',
        'ZIP_CODE',
      ];
      const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
      fs.unlinkSync(csvFilePath);

      const { error, records } = await this.parseFile(fileContent, headers);
      if (!!error) {
        return { error };
      }
      if (records?.length <= 1) {
        return { error: 'Invalid csv format' };
      }

      const mandatoryFields = z.object({
        FIRST_NAME: z
          .string()
          .min(1, { message: 'Please enter your first name.' })
          .max(30, 'Your last name exceeds the character limit.')
          .refine((value) => !/^\s|\s$/.test(value), {
            message: 'Leading or trailing white spaces are not allowed',
          })
          .refine((value) => /^[a-zA-Z]+$/.test(value), {
            message:
              'Please enter a valid first name. Numbers are not allowed.',
          }),
        LAST_NAME: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your last name.' })
            .max(30, 'Your last name exceeds the character limit.'),
        ),
        EMAIL: z
          .string()
          .min(1, { message: 'Please enter your email address.' })
          .email('Please enter a valid email.'),
        PHONE: z
          .string()
          .regex(new RegExp(/^\d{10}$/), 'Invalid phone number!'),
        ADDRESS: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your address.' })
            .max(100, 'Your address exceeds the character limit.'),
        ),
        ADDRESS2: parseStringWithWhitespace(
          z.string().max(100, 'Your address exceeds the character limit.'),
        ),
        CITY: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your city.' })
            .max(30, 'Your city exceeds the character limit.'),
        ),
        STATE: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your state.' })
            .max(30, 'Your state exceeds the character limit.'),
        ),
        COUNTRY: z.string(),
        ZIP_CODE: parseStringWithWhitespace(
          z
            .string()
            .min(1, { message: 'Please enter your zip code.' })
            .max(10, 'Your zip code exceeds the character limit.'),
        ),
      });
      const schema = z.preprocess(
        (args) => {
          return { mandatory: args };
        },
        z.object({
          mandatory: mandatoryFields,
        }),
      );

      // Remove first element from an array
      records.shift();
      const import_status = { success: [], failed: [] };
      for (let index = 0; index < records.length; index++) {
        const user = records[index];
        const password = generateRandomPassword(10);
        try {
          schema.parse(user);
          const body = {
            first_name: user.FIRST_NAME,
            last_name: user.LAST_NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            address: user.ADDRESS,
            address2: user?.ADDRESS2,
            city: user.CITY,
            state: user.STATE,
            country: user.COUNTRY,
            zip_code: user.ZIP_CODE,
            force_password_change: true,
            role: Role.Customer,
            password,
          };
          const { errors } = await trimAndValidateCustom(SignupDto, body, [
            'password',
          ]);
          if (!!errors) {
            import_status.failed.push({
              ...user,
              error: errors.flatMap((err) => ({
                path: [err.property?.toUpperCase()],
                message: err.constraints[Object.keys(err.constraints)[0]],
              })),
            });
            continue;
          }
          const { error, data } = await this.create({
            action: 'import',
            body: {
              first_name: user.FIRST_NAME,
              last_name: user.LAST_NAME,
              email: user.EMAIL,
              phone: user.PHONE,
              address: user.ADDRESS,
              address2: user?.ADDRESS2,
              city: user.CITY,
              state: user.STATE,
              country: user.COUNTRY,
              zip_code: user.ZIP_CODE,
              force_password_change: true,
              role: Role.Customer,
              password,
            },
          });
          if (!!error) {
            import_status.failed.push({
              ...user,
              error: [
                {
                  message: error.message || error,
                  path: ['server'],
                },
              ],
            });
            continue;
          }

          await this.msClient.executeJob(
            'controller.notification',
            new Job({
              action: 'send',
              payload: {
                user_id: data.id,
                template: 'imported_customer_welcome_mail',
                skipUserConfig: true,
                variables: {
                  TO_NAME: data.name,
                  USERNAME: data.email,
                  PASSWORD: password,
                  LOGIN_LINK: process.env.WEBSITE_URL + '/auth/signin',
                },
              },
            }),
          );

          import_status.success.push({ ...user });
        } catch (error) {
          if (error instanceof ZodError) {
            const issues = error.issues;
            import_status.failed.push({
              ...user,
              error: issues.flatMap((i) => {
                return {
                  message: i.message,
                  path: i.path.filter((x) => x !== 'mandatory'),
                };
              }),
            });
          }
        }
      }
      return { data: import_status };
    } catch (error) {
      return { error };
    }
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
      const { user_id } = job.payload;
      const { error, data } = await this.$db.findRecordById({
        id: +user_id,
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

  async createOtpSession(user: OwnerDto, email: string): Promise<JobResponse> {
    const { error, data } = await this.otpSessionService.create({
      body: {
        user_id: user.id,
        otp: otp(4),
        type: OtpSessionType.EmailVerify,
        expire_at: new Date(Date.now() + 15 * 60 * 1000),
        payload: {
          email,
          user: user.name,
        },
      },
    });
    // TODO: send a email/sms notification
    if (!error) {
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            skipUserConfig: true,
            users: [
              {
                name: user.name,
                email: email,
                send_email: true,
              },
            ],
            template: 'email_verification',
            variables: {
              OTP: data.otp,
            },
          },
        }),
      );
    }
    return { error, data };
  }
}
