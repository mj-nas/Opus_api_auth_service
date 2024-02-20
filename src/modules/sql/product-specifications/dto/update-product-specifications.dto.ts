import { OmitType, PartialType } from '@nestjs/swagger';
import { ProductSpecifications } from '../entities/product-specifications.entity';

export class UpdateProductSpecificationsDto extends PartialType(
  OmitType(ProductSpecifications, [] as const),
) {}
