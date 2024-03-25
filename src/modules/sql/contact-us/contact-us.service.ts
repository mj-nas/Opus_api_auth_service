import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService extends ModelService<ContactUs> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(db: SqlService<ContactUs>) {
    super(db);
  }
}
