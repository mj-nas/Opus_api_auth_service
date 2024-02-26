import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ProductGallery } from '../entities/product-gallery.entity';

export class CreatePresignedUrl extends OmitType(ProductGallery, [
  'active',
  'product_id',
  'product_image',
  'is_primary',
]) {
  @ApiProperty({
    description: 'key for creating presigned url',
    example: '323434343434.png',
  })
  @IsString()
  key: string;
}
