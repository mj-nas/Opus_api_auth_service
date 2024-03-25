import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { LearnArticle } from '../entities/learn-article.entity';

export class BulkUpdateSortDto extends PickType(LearnArticle, [
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
