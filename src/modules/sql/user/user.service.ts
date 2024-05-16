import {
  generateRandomPassword,
  parseStringWithWhitespace,
  trimAndValidateCustom,
} from './../../../core/core.utils';
/* eslint-disable prettier/prettier */
import {
  ModelService,
  SqlCreateResponse,
  SqlDeleteResponse,
  SqlJob,
  SqlService,
  SqlUpdateResponse,
} from '@core/sql';
import { Injectable } from '@nestjs/common';
import { CsvError, parse } from 'csv-parse';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import config from 'src/config';
import { Job, JobResponse } from 'src/core/core.job';
import { compareHash, generateHash } from 'src/core/core.utils';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { ZodError, z } from 'zod';
import { AddressService } from '../address/address.service';
import { SignupDto } from '../auth/dto/signup.dto';
import { User } from './entities/user.entity';
import { Role } from './role.enum';

@Injectable()
export class UserService extends ModelService<User> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(
    db: SqlService<User>,
    private msClient: MsClientService,
    private addressService: AddressService,
  ) {
    super(db);
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
    const { active, id } = response.data;
    const { active: previousActive } = response.previousData;

    // check if the status changed
    if (previousActive !== active) {
      const status = active ? 'activated' : 'deactivated';
      await this.msClient.executeJob(
        'controller.notification',
        new Job({
          action: 'send',
          payload: {
            template: 'account_status_update',
            variables: {
              STATUS: status,
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
      first_name,
      last_name,
      phone,
      email,
      address,
      city,
      state,
      zip_code,
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
        city,
        state,
        zip_code,
      },
    });
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
        'Phone',
        'Address',
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
            `${x?.phone}`,
            x?.address,
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
        { header: 'Phone', key: 'phone', width: 50 },
        { header: 'Address', key: 'address', width: 50 },
        { header: 'City', key: 'city', width: 50 },
        { header: 'State', key: 'state', width: 50 },
        { header: 'Zip Code', key: 'zip_code', width: 15 },
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
            .max(6, 'Your zip code exceeds the character limit.'),
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
            city: user.CITY,
            state: user.STATE,
            country: user.COUNTRY,
            zip_code: user.ZIP_CODE,
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
              city: user.CITY,
              state: user.STATE,
              country: user.COUNTRY,
              zip_code: user.ZIP_CODE,
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
}
