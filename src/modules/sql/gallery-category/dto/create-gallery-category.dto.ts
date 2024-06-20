import { OmitType } from '@nestjs/swagger';
import { GalleryCategory } from '../entities/gallery-category.entity';

export class CreateGalleryCategoryDto extends OmitType(GalleryCategory, ['active'] as const) {}
