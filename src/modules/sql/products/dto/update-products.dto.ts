import { OmitType, PartialType } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';

export class UpdateProductsDto extends PartialType(
  OmitType(Products, [] as const),
) {}
