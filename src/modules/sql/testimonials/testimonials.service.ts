import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Testimonials } from './entities/testimonials.entity';

@Injectable()
export class TestimonialsService extends ModelService<Testimonials> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Testimonials>) {
    super(db);
  }

  async getHomePageTestimonials() {
    try {
      const { data } = await this.$db.getAllRecords({
        options: {
          limit: 10,
          order: [['created_at', 'desc']],
          where: { active: true },
        },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
