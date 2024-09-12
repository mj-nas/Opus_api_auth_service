import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { Order } from '../entities/order.entity';
import { CardDetailsDto } from './card_details_dto';

export class ReorderDto extends PickType(Order, ['repeating_days'] as const) {
  @ApiProperty({
    type: CardDetailsDto,
    isArray: false,
  })
  @IsOptional()
  @IsObject()
  card_details: CardDetailsDto;
}
