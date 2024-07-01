import { PartialType, PickType } from '@nestjs/swagger';
import { OrderItem } from '../entities/order-item.entity';

export class UpdateOrderItemDto extends PartialType(
  PickType(OrderItem, ['status'] as const),
) {}
