import { PickType } from '@nestjs/swagger';
import { OrderAddress } from '../entities/order-address.entity';

export class CreateOrderAddressDto extends PickType(OrderAddress, [
  'billing_address_id',
  'billing_first_name',
  'billing_last_name',
  'billing_email',
  'billing_phone',
  'billing_address',
  'billing_city',
  'billing_state',
  'billing_zip_code',
  'shipping_first_name',
  'shipping_last_name',
  'shipping_email',
  'shipping_phone',
  'shipping_address',
  'shipping_city',
  'shipping_state',
  'shipping_zip_code',
] as const) {}
