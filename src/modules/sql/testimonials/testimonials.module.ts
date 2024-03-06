import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { Testimonials } from './entities/testimonials.entity';

@Module({
  imports: [SqlModule.register(Testimonials)],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
})
export class TestimonialsModule {}
