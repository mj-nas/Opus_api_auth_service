import { OmitType, PartialType } from '@nestjs/swagger';
import { ContactUs } from '../entities/contact-us.entity';

export class UpdateContactUsDto extends PartialType(
  OmitType(ContactUs, [] as const),
) {}
