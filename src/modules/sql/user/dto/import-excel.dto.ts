import { ApiProperty } from '@nestjs/swagger';

export class ImportExcelDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Csv File',
  })
  csv_file?: any;
}
