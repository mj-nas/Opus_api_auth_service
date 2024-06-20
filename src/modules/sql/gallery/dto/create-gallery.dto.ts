import { OmitType } from '@nestjs/swagger';
import { Gallery } from '../entities/gallery.entity';

export class CreateGalleryDto extends OmitType(Gallery, ['active'] as const) {}
