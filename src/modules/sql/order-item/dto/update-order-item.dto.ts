import { PickType } from '@nestjs/swagger';
import { OrderItem } from '../entities/order-item.entity';

export class UpdateOrderItemDto extends PickType(OrderItem, [
  'status',
] as const) {}
