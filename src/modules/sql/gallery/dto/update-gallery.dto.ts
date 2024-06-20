import { OmitType, PartialType } from '@nestjs/swagger';
import { Gallery } from '../entities/gallery.entity';

export class UpdateGalleryDto extends PartialType(
  OmitType(Gallery, [] as const),
) {}
