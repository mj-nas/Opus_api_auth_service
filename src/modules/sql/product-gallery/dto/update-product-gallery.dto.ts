import { OmitType, PartialType } from '@nestjs/swagger';
import { ProductGallery } from '../entities/product-gallery.entity';

export class UpdateProductGalleryDto extends PartialType(
  OmitType(ProductGallery, [] as const),
) {}
