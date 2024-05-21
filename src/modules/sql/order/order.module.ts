import { SqlModule } from '@core/sql';
import { StripeModule } from '@core/stripe';
import { Module } from '@nestjs/common';
import { OrderAddressModule } from '../order-address/order-address.module';
import { OrderItemModule } from '../order-item/order-item.module';
import { OrderPaymentModule } from '../order-payment/order-payment.module';
import { OrderStatusLogModule } from '../order-status-log/order-status-log.module';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    SqlModule.register(Order),
    OrderItemModule,
    OrderAddressModule,
    OrderStatusLogModule,
    OrderPaymentModule,
    StripeModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
