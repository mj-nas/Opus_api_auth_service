import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ChangeDispenserDto {
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @IsNumber()
  user_id: number;
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @IsNumber()
  dispenser_id: number;
}
