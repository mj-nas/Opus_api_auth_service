/* eslint-disable prettier/prettier */
import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Job, JobResponse } from 'src/core/core.job';
import { generateHash, compareHash } from 'src/core/core.utils';

@Injectable()
export class UserService extends ModelService<User> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(db: SqlService<User>) {
    super(db);
  }


  async changePassword(job: Job): Promise<JobResponse> {
    // eslint-disable-next-line prefer-const
    let { owner, payload } = job
    const password = await generateHash(payload.password);
    if (!(await compareHash(payload.old_password, owner.password))) {
      return { error: 'Your current password is wrong. Please try again.' };
    }

    //check password and old password are same
    if (await compareHash(payload.password, owner.password)) {
      return {
        error: 'Your new password has to be different from  your old password ',
      };
    }

    try {
      const userResult = await this.$db.updateRecord(
        {
          action: 'findById',
          id: owner.id,
          body: {
            password,
          },
        }
      );
      return userResult;
    } catch (error) {
      return { error };
    }
  }
}
