import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { CreateOrderAddressDto } from '../../order-address/dto/create-order-address.dto';
import { CreateOrderItemDto } from '../../order-item/dto/create-order-item.dto';
import { Order } from '../entities/order.entity';
import { CardDetailsDto } from './card_details_dto';
import { OrderAddress } from '../../order-address/entities/order-address.entity';

export class CreateQuoteDto extends PickType(OrderAddress, ['shipping_city', 'shipping_zip_code'] as const) {
  @ApiProperty({
    type: CreateOrderItemDto,
    isArray: true,
  })
  @IsArray()
  items: CreateOrderItemDto[];

  // @ApiProperty({
  //   type: CreateOrderAddressDto,
  //   isArray: false,
  // })
  // @IsObject()
  // address: CreateOrderAddressDto;

  // @ApiProperty({
  //   type: CardDetailsDto,
  //   isArray: false,
  // })
  // @IsOptional()
  // @IsObject()
  // card_details: CardDetailsDto;
}
