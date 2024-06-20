import { OmitType, PartialType } from '@nestjs/swagger';
import { GalleryCategory } from '../entities/gallery-category.entity';

export class UpdateGalleryCategoryDto extends PartialType(
  OmitType(GalleryCategory, [] as const),
) {}
