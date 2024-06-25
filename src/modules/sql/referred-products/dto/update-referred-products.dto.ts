import { OmitType, PartialType } from '@nestjs/swagger';
import { ReferredProducts } from '../entities/referred-products.entity';

export class UpdateReferredProductsDto extends PartialType(
  OmitType(ReferredProducts, [] as const),
) {}
