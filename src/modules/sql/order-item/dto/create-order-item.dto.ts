import { PickType } from '@nestjs/swagger';
import { OrderItem } from '../entities/order-item.entity';

export class CreateOrderItemDto extends PickType(OrderItem, [
  'product_id',
  'quantity',
] as const) {}
