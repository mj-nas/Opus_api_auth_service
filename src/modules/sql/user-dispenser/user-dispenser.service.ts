import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { UserDispenser } from './entities/user-dispenser.entity';

@Injectable()
export class UserDispenserService extends ModelService<UserDispenser> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<UserDispenser>) {
    super(db);
  }
}
