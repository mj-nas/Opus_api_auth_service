import { OmitType } from '@nestjs/swagger';
import { Testimonials } from '../entities/testimonials.entity';

export class CreateTestimonialsDto extends OmitType(Testimonials, ['active'] as const) {}
