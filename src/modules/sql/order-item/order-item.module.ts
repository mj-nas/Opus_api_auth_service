import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';

@Module({
  imports: [SqlModule.register(OrderItem)],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
