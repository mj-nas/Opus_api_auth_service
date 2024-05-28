import { PickType } from '@nestjs/swagger';
import { Order } from '../entities/order.entity';

export class ReorderDto extends PickType(Order, ['repeating_days'] as const) {}
