import { OmitType } from '@nestjs/swagger';
import { ProductGallery } from '../entities/product-gallery.entity';

export class CreateProductGalleryDto extends OmitType(ProductGallery, ['active'] as const) {}
