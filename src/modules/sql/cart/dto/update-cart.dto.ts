import { OmitType, PartialType } from '@nestjs/swagger';
import { Cart } from '../entities/cart.entity';

export class UpdateCartDto extends PartialType(OmitType(Cart, [] as const)) {}
