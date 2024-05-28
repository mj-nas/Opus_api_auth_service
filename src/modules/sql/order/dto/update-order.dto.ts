import { OmitType, PartialType } from '@nestjs/swagger';
import { Order } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(OmitType(Order, [] as const)) {}
