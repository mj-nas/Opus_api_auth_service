import { OmitType, PartialType } from '@nestjs/swagger';
import { Testimonials } from '../entities/testimonials.entity';

export class UpdateTestimonialsDto extends PartialType(
  OmitType(Testimonials, [] as const),
) {}
