import { OmitType, PartialType } from '@nestjs/swagger';
import { OrderItem } from '../entities/order-item.entity';

export class UpdateOrderItemDto extends PartialType(
  OmitType(OrderItem, [] as const),
) {}
