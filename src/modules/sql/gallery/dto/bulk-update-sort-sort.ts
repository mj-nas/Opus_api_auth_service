import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Gallery } from '../entities/gallery.entity';

export class BulkUpdateGallerySortDto extends PickType(Gallery, [
  'sort',
] as const) {
  @ApiProperty({
    format: 'int32',
    description: 'Id',
    example: 1,
  })
  @IsNumber()
  id: number;
}
