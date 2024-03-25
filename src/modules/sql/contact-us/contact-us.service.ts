import { ModelService, SqlJob, SqlService, WrapSqlJob } from '@core/sql';
import { ReadPayload } from '@core/sql/sql.decorator';
import { Injectable } from '@nestjs/common';
import { JobResponse } from 'src/core/core.job';
import { BulkDeleteMode } from './bulk-delete-mode.enum';
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

  @WrapSqlJob
  @ReadPayload
  async allDelete(job: SqlJob<ContactUs>): Promise<JobResponse> {
    try {
      const { options } = job;
      const { error, data } = await this.$db.deleteBulkRecords({
        options: { ...options },
      });
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async bulkDelete(job: SqlJob<ContactUs>): Promise<JobResponse> {
    try {
      const { body, payload } = job;
      if (body?.mode === BulkDeleteMode.All) {
        const { error, data } = await this.allDelete({
          payload: { ...payload },
        });
        if (error) return { error };
        return { data };
      }

      const { error, data } = await this.$db.deleteBulkRecords({
        options: {
          where: {
            id: body?.ids || [],
          },
        },
      });
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
