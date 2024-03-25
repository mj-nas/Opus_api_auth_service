import { OmitType } from '@nestjs/swagger';
import { ContactUs } from '../entities/contact-us.entity';

export class CreateContactUsDto extends OmitType(ContactUs, ['active'] as const) {}
