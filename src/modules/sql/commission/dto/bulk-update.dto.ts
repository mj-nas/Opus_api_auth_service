import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, ValidateIf } from 'class-validator';
import { BulkDeleteMode } from '../../contact-us/bulk-delete-mode.enum';

export class BulkUpdateDto {
  @ApiProperty({
    enum: BulkDeleteMode,
    description: 'Bulk Update Mode',
    example: BulkDeleteMode.Selected,
    default: BulkDeleteMode.Selected,
  })
  @IsEnum(BulkDeleteMode)
  mode: BulkDeleteMode;

  @ApiProperty({
    type: 'array',
    description: 'Array of ids to update',
    example: [1, 2, 3],
  })
  @ValidateIf((o) => o.mode === BulkDeleteMode.Selected)
  @IsNumber({}, { each: true })
  ids: number[];
}
