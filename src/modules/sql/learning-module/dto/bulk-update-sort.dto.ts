import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { LearningModule } from '../entities/learning-module.entity';

export class BulkUpdateSortDto extends PickType(LearningModule, [
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
