import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePresignedUrl {
  @ApiProperty({
    description: 'key for creating presigned url',
    example: '323434343434.png',
  })
  @IsString()
  key: string;
}
