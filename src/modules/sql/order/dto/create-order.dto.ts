import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { CreateOrderAddressDto } from '../../order-address/dto/create-order-address.dto';
import { CreateOrderItemDto } from '../../order-item/dto/create-order-item.dto';
import { Order } from '../entities/order.entity';
import { CardDetailsDto } from './card_details_dto';

export class CreateOrderDto extends PickType(Order, [
  'cart_id',
  'sub_total',
  'shipping_price',
  'tax',
  'total',
  'is_repeating_order',
  'repeating_days',
  'coupon_id',
  'coupon_discount',
  'coupon_type',
  'coupon_discount_amount',
  'coupon_code',
] as const) {
  @ApiProperty({
    type: CreateOrderItemDto,
    isArray: true,
  })
  @IsArray()
  items: CreateOrderItemDto[];

  @ApiProperty({
    type: CreateOrderAddressDto,
    isArray: false,
  })
  @IsObject()
  address: CreateOrderAddressDto;

  @ApiProperty({
    type: CardDetailsDto,
    isArray: false,
  })
  @IsOptional()
  @IsObject()
  card_details: CardDetailsDto;
}
