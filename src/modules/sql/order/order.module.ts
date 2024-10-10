import { SqlModule } from '@core/sql';
import { StripeModule } from '@core/stripe';
import { XpsModule } from '@core/xps';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MsClientModule } from 'src/core/modules/ms-client/ms-client.module';
import { CouponUsedModule } from '../coupon-used/coupon-used.module';
import { CouponModule } from '../coupon/coupon.module';
import { OrderAddressModule } from '../order-address/order-address.module';
import { OrderItemModule } from '../order-item/order-item.module';
import { OrderPaymentModule } from '../order-payment/order-payment.module';
import { OrderStatusLogModule } from '../order-status-log/order-status-log.module';
import { ProductsModule } from '../products/products.module';
import { SettingModule } from '../setting/setting.module';
import { UserModule } from '../user/user.module';
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
    MsClientModule,
    UserModule,
    CouponModule,
    CouponUsedModule,
    XpsModule,
    ConfigModule,
    SettingModule,
    ProductsModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
