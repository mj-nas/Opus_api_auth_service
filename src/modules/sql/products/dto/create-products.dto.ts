import { OmitType } from '@nestjs/swagger';
import { Products } from '../entities/products.entity';

export class CreateProductsDto extends OmitType(Products, ['active'] as const) {}
