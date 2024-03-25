import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { LearnYoutube } from '../entities/learn-youtube.entity';

export class BulkUpdateSortDto extends PickType(LearnYoutube, [
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
