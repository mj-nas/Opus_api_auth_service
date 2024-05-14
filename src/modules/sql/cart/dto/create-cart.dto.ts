import { OmitType } from '@nestjs/swagger';
import { Cart } from '../entities/cart.entity';

export class CreateCartDto extends OmitType(Cart, ['active'] as const) {}
