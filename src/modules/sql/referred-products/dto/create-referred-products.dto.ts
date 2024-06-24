import { OmitType } from '@nestjs/swagger';
import { ReferredProducts } from '../entities/referred-products.entity';

export class CreateReferredProductsDto extends OmitType(ReferredProducts, ['active'] as const) {}
