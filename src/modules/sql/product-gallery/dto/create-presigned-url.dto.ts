
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProductGallery } from '../entities/product-gallery.entity';

export class CreatePresignedUrl extends OmitType(ProductGallery, ['active',]) {
  
  @ApiProperty({
    description: 'key for creating presigned url',
    example: "323434343434.png",
  })
  key:string;

}