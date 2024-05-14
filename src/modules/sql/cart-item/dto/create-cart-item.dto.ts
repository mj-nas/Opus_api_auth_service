import { OmitType } from '@nestjs/swagger';
import { CartItem } from '../entities/cart-item.entity';

export class CreateCartItemDto extends OmitType(CartItem, ['active'] as const) {}
