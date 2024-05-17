import { SqlModule } from '@core/sql';
import { Module } from '@nestjs/common';
import { OrderAddressModule } from '../order-address/order-address.module';
import { OrderItemModule } from '../order-item/order-item.module';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [SqlModule.register(Order), OrderItemModule, OrderAddressModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
