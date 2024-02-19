import { OmitType, PartialType } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product-category.entity';

export class UpdateProductCategoryDto extends PartialType(
  OmitType(ProductCategory, [] as const),
) {}
