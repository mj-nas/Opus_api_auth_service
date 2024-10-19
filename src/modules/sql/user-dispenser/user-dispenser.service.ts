import { ModelService, SqlCreateResponse, SqlJob, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Job } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { UserService } from '../user/user.service';
import { UserDispenser } from './entities/user-dispenser.entity';

@Injectable()
export class UserDispenserService extends ModelService<UserDispenser> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(
    db: SqlService<UserDispenser>,
    private readonly msClient: MsClientService,
    private readonly userService: UserService,
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
    job: SqlJob<UserDispenser>,
    response: SqlCreateResponse<UserDispenser>,
  ): Promise<void> {
    const user = await this.userService.findById({
      action: 'findById',
      id: response.data.user_id,
    });
    const dispenser = await this.userService.findById({
      action: 'findById',
      id: response.data.dispenser_id,
    });
    if (user.error || dispenser.error) {
      throw new Error('User or Dispenser not found');
    }
    // send maiil to dispenser
    await this.msClient.executeJob(
      'controller.notification',
      new Job({
        action: 'send',
        payload: {
          user_id: dispenser.data.id,
          template: 'customer_added_dispenser',
          skipUserConfig: true,
          variables: {
            CUSTOMER_NAME: user.data.name,
            CUSTOMER_CONTACT_INFO: user.data.email,
          },
        },
      }),
    );
    // send maiil to customer
    await this.msClient.executeJob(
      'controller.notification',
      new Job({
        action: 'send',
        payload: {
          user_id: user.data.id,
          template: 'dispenser_added_customer',
          skipUserConfig: true,
          variables: {
            DISPENSER_NAME: dispenser.data.name,
            DISPENSER_CONTACT_INFO: dispenser.data.email,
          },
        },
      }),
    );
  }
}
