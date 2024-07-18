import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { LearningVideo } from '../entities/learning-video.entity';

export class BulkUpdateSortDto extends PickType(LearningVideo, [
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
