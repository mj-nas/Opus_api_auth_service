import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { CreateOrderAddressDto } from '../../order-address/dto/create-order-address.dto';
import { CreateOrderItemDto } from '../../order-item/dto/create-order-item.dto';
import { Order } from '../entities/order.entity';

export class CreateOrderDto extends PickType(Order, [
  'cart_id',
  'sub_total',
  'shipping_price',
  'tax',
  'total',
  'sub_total',
  'is_repeating_order',
  'repeating_days',
] as const) {
  @ApiProperty({
    type: CreateOrderItemDto,
    isArray: false,
  })
  @IsObject()
  items: CreateOrderItemDto;

  @ApiProperty({
    type: CreateOrderAddressDto,
    isArray: false,
  })
  @IsObject()
  address: CreateOrderAddressDto;
}
