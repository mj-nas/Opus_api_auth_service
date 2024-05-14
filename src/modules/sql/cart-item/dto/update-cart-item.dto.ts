import { OmitType, PartialType } from '@nestjs/swagger';
import { CartItem } from '../entities/cart-item.entity';

export class UpdateCartItemDto extends PartialType(
  OmitType(CartItem, [] as const),
) {}
