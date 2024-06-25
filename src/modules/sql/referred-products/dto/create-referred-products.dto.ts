import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateReferredProductsDto {
  @ApiProperty({
    format: 'uint32',
    description: 'product_id',
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    format: 'string',
    description: 'name',
    example: 'product1',
  })
  name: string;

  @ApiProperty({
    format: 'string',
    description: 'product_image',
    example: '/img/product1.jpg',
  })
  product_image: string;

  @ApiProperty({
    format: 'string',
    description: 'slug',
    example: 'slug',
  })
  @IsString()
  slug: string;
}
