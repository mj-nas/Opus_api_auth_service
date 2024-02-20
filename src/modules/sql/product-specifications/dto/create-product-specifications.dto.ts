import { OmitType } from '@nestjs/swagger';
import { ProductSpecifications } from '../entities/product-specifications.entity';

export class CreateProductSpecificationsDto extends OmitType(ProductSpecifications, ['active'] as const) {}
