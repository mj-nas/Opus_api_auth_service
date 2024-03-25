import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, ValidateIf } from 'class-validator';
import { BulkDeleteMode } from '../bulk-delete-mode.enum';

export class BulkDeleteDto {
  @ApiProperty({
    enum: BulkDeleteMode,
    description: 'Bulk Delete Mode',
    example: BulkDeleteMode.Selected,
    default: BulkDeleteMode.Selected,
  })
  @IsEnum(BulkDeleteMode)
  mode: BulkDeleteMode;

  @ApiProperty({
    type: 'array',
    description: 'Array of ids to delete',
    example: [1, 2, 3],
  })
  @ValidateIf((o) => o.mode === BulkDeleteMode.Selected)
  @IsNumber({}, { each: true })
  ids: number[];
}
