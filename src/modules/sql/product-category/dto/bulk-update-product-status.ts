import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ProductCategory } from '../entities/product-category.entity';

export class BulkUpdateProductStatusDto extends PickType(ProductCategory, [
  'status',
] as const) {
  @ApiProperty({
    format: 'int32',
    description: 'Setting Id',
    example: 1,
  })
  @IsNumber()
  id: number;
}
