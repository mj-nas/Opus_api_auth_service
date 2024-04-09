import { OmitType } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product-category.entity';

export class CreateProductCategoryDto extends OmitType(ProductCategory, [
  'active',
] as const) {}
